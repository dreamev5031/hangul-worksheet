import type { PracticePoint, StrokePath, StrokeValidationConfig, StrokeValidationResult } from './types'
import {
  boundingArea,
  cosineSimilarity,
  distance,
  pointToPolylineDistance,
  polylineLength,
  resamplePolyline,
} from './strokePath'

export const BASE_STROKE_VALIDATION_CONFIG: StrokeValidationConfig = {
  sampleCount: 36,
  baseTolerance: 0.105,
  startToleranceMultiplier: 1.55,
  endToleranceMultiplier: 1.8,
  minimumLengthRatio: 0.42,
  maximumLengthRatio: 4.1,
  minimumNearRatio: 0.46,
  minimumCoverageRatio: 0.42,
  minimumWaypointRatio: 0.9,
  minimumDirectionCosine: 0.05,
  maximumBoundingArea: 0.62,
}

export function getAssistedValidationConfig(retryCount: number, stroke: StrokePath): StrokeValidationConfig {
  const level = Math.min(3, Math.max(0, retryCount))
  const toleranceMultiplier = level >= 3 ? 1.7 : level === 2 ? 1.35 : 1
  return {
    ...BASE_STROKE_VALIDATION_CONFIG,
    baseTolerance: Math.max(BASE_STROKE_VALIDATION_CONFIG.baseTolerance, stroke.tolerance) * toleranceMultiplier,
    startToleranceMultiplier: level >= 3 ? 2.15 : level === 2 ? 1.85 : 1.55,
    endToleranceMultiplier: level >= 3 ? 2.35 : level === 2 ? 2.05 : 1.8,
    minimumLengthRatio: level >= 3 ? 0.27 : level === 2 ? 0.34 : 0.42,
    maximumLengthRatio: level >= 3 ? 5.4 : level === 2 ? 4.8 : 4.1,
    minimumNearRatio: level >= 3 ? 0.3 : level === 2 ? 0.38 : 0.46,
    minimumCoverageRatio: level >= 3 ? 0.28 : level === 2 ? 0.35 : 0.42,
    minimumWaypointRatio: level >= 3 ? 0.55 : level === 2 ? 0.75 : 0.9,
    minimumDirectionCosine: level >= 3 ? -0.1 : level === 2 ? -0.02 : 0.05,
    maximumBoundingArea: level >= 3 ? 0.76 : level === 2 ? 0.69 : 0.62,
  }
}

export function validateStroke(
  userPoints: PracticePoint[],
  referenceStroke: StrokePath,
  retryCount = 0,
): StrokeValidationResult {
  const config = getAssistedValidationConfig(retryCount, referenceStroke)
  const reference = resamplePolyline(referenceStroke.guidePoints, config.sampleCount)
  const user = resamplePolyline(userPoints, config.sampleCount)
  const emptyMetrics = {
    startDistance: Number.POSITIVE_INFINITY,
    endDistance: Number.POSITIVE_INFINITY,
    directionCosine: 0,
    nearRatio: 0,
    coverageRatio: 0,
    waypointRatio: 0,
    lengthRatio: 0,
    boundingArea: 0,
  }
  if (userPoints.length < 2 || user.length < 2 || reference.length < 2) {
    return { accepted: false, reason: 'empty', metrics: emptyMetrics }
  }

  const referenceLength = Math.max(polylineLength(reference), Number.EPSILON)
  const userLength = polylineLength(userPoints)
  const lengthRatio = userLength / referenceLength
  const startDistance = distance(user[0], reference[0])
  const endDistance = distance(user[user.length - 1], reference[reference.length - 1])
  const directionReferenceIndex = referenceStroke.closed ? Math.max(1, Math.floor(reference.length * 0.2)) : reference.length - 1
  const directionUserIndex = referenceStroke.closed ? Math.max(1, Math.floor(user.length * 0.2)) : user.length - 1
  const directionCosine = cosineSimilarity(
    user[0],
    user[directionUserIndex],
    reference[0],
    reference[directionReferenceIndex],
  )
  const tolerance = config.baseTolerance
  const nearRatio = user.filter((point) => pointToPolylineDistance(point, reference) <= tolerance).length / user.length
  const coverageRatio = reference.filter((point) => pointToPolylineDistance(point, user) <= tolerance * 1.12).length / reference.length
  const waypointRatio = referenceStroke.waypoints.length
    ? referenceStroke.waypoints.filter((point) => pointToPolylineDistance(point, user) <= tolerance * 1.25).length / referenceStroke.waypoints.length
    : 1
  const area = boundingArea(userPoints)
  const metrics = { startDistance, endDistance, directionCosine, nearRatio, coverageRatio, waypointRatio, lengthRatio, boundingArea: area }

  if (lengthRatio < config.minimumLengthRatio) return { accepted: false, reason: 'too-short', metrics }

  const reverseEndpointDistance = distance(user[0], reference[reference.length - 1]) + distance(user[user.length - 1], reference[0])
  const forwardEndpointDistance = startDistance + endDistance
  if (directionCosine < -0.22 || (!referenceStroke.closed && reverseEndpointDistance + tolerance * 0.25 < forwardEndpointDistance)) {
    return { accepted: false, reason: 'reverse-direction', metrics }
  }

  if (lengthRatio > config.maximumLengthRatio || (area > config.maximumBoundingArea && nearRatio < 0.58)) {
    return { accepted: false, reason: 'scribble', metrics }
  }

  if (startDistance > tolerance * config.startToleranceMultiplier || endDistance > tolerance * config.endToleranceMultiplier) {
    return { accepted: false, reason: 'wrong-location', metrics }
  }

  if (waypointRatio < config.minimumWaypointRatio) return { accepted: false, reason: 'missed-turn', metrics }

  const accepted = nearRatio >= config.minimumNearRatio
    && coverageRatio >= config.minimumCoverageRatio
    && directionCosine >= config.minimumDirectionCosine

  return accepted
    ? { accepted: true, metrics }
    : { accepted: false, reason: 'off-path', metrics }
}

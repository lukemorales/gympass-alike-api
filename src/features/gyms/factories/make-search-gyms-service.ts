import { GetNearbyGymsService } from '../get-nearby-gyms.service';
import { GymsPrismaRepository } from '../repositories';

export function makeGetNearbyGymsService() {
  const gymsRepository = new GymsPrismaRepository();

  return new GetNearbyGymsService(gymsRepository);
}

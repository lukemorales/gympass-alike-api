import { SearchGymsService } from '../search-gyms.service';
import { GymsPrismaRepository } from '../repositories';

export function makeSearchGymsService() {
  const gymsRepository = new GymsPrismaRepository();

  return new SearchGymsService(gymsRepository);
}

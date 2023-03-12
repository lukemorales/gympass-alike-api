import { CreateGymService } from '../create-gym.service';
import { GymsPrismaRepository } from '../repositories';

export function makeCreateGymService() {
  const gymsRepository = new GymsPrismaRepository();

  return new CreateGymService(gymsRepository);
}

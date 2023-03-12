import { ListUserCheckInHistoryService } from '../list-user-check-in-history.service';
import { CheckInsPrismaRepository } from '../repositories';

export function makeListUserCheckInHistoryService() {
  const checkInsRepository = new CheckInsPrismaRepository();

  return new ListUserCheckInHistoryService(checkInsRepository);
}

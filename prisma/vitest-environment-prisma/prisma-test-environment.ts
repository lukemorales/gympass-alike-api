// eslint-disable-next-line import/no-extraneous-dependencies
import { type Environment } from 'vitest';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default <Environment>{
  name: 'prisma',
  async setup() {
    // eslint-disable-next-line no-console
    console.log('setup');

    return {
      teardown(_global) {
        // eslint-disable-next-line no-console
        console.log('teardown');
      },
    };
  },
};

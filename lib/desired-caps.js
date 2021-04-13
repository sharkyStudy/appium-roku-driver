
let commonCapConstraints = {
  platformName: {
    isString: true,
    inclusionCaseInsensitive: ['Roku'],
    presence: true
  },
  deviceName: {
    isString: true
  },
  app: {
    isString: true,
    presence: true
  },
  appId: {
    isString: true,
    presence: true
  },
  contentId: {
    isString: true
  },
  mediaType: {
    isString: true
  },
  ip: {
    isString: true,
    presence: true
  },
  password: {
    isString: true,
    presence: true,
  },
  username: {
    isString: true,
    presence: false,
  },
};

let desiredCapConstraints = {};

Object.assign(desiredCapConstraints, commonCapConstraints);

export default desiredCapConstraints;
export {commonCapConstraints};

import { IMentorApplication } from './mentorApplication.model';

export const sanitizeMentorApplication = (application: IMentorApplication) => {
  const obj = application.toObject ? application.toObject() : application;
  return obj;
};

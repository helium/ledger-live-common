import { Account } from "../types";


export const botReportFolder = async (
  BOT_REPORT_FOLDER: string,
  body: string,
  allAccountsBefore: Account[],
  allAccountsAfter: Account[]
) => {
  // fs and path is not working 
  // on mobile so we exclude these modules
  // to not have a crash on run
};

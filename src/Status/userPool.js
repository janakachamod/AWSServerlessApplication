import { CognitoUserPool } from "amazon-cognito-identity-js";

const poodData={
    UserPoolId: "eu-north-1_LS6g0dgkM",  
    ClientId: "7liotnkjatl52st4o36eaipt7h"
}

export default new CognitoUserPool(poodData);
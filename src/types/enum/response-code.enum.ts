enum ResponseCode{
    //HTTP Status 200
    SUCCESS = "SU",

    //HTTP Status 400
    VALIDATION_FAILED = "VF",
    DUPLICATE_EMAIL = "DE",
    DUPLICATE_PHONE = "DP",
    DUPLICATE_NICKNAME = "DN",
    NOT_EXISTED_SCHEDULE = "NS",
    NOT_EXISTED_TODO = "NT",

    //HTTP Status 401
    SIGN_IN_FAIL = "SF",

    //HTTP Status 500
    DATABASE_ERROR = "DBE"
}

export default ResponseCode;
export enum Location{
    PROFILE='profile',
    ACCOUNT='account',
    CONTRACT='contract'
}

export enum PriorityLevel{
    NORMAL='normal',
    PUSH='push',
    MAIL='mail',
}

export enum Events{
    DELIVERY="delivery made",
    PROMISEE_JOINS="promisee joins",
    PROMISEE_AGREES="promisee agrees",
    AGREEMENT_REACHED="agreement reached",
    BUYER_PAID="buyer makes payment",
    FUND_RELEASED="fund released",
    CONTRACT_DECLINED="contract declined",
    CONTRACT_RESOLVED="contract resolved",
}
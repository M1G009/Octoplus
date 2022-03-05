export interface Access {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
}

export interface IAddScopeData {
    name: string;
    slug: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
}

export interface Scope {
    name: string;
    slug: string;
    access: Access;
}

export interface ICreateRoleScopeData {
    name: string;
    scopes: Scope[];
}

export interface TeamMember {
    username: string;
    email: string;
    user_id: string;
    role_name: string;
}

export interface RoleNames {
    label: string;
    id: string;
}

export interface RoleData {
    _id: string;
    role: ICreateRoleScopeData;
}

export interface InviteFields {
    name: string;
    email: string;
    role: RoleNames
}

export interface Values {
    currentpass: string,
    password: string,
    confirmpass: string
}

export interface CardFields {
    Card_name: string;
    card_number: string;
    cvv: string;
    expire_date: string;
    is_primary: string;
}

export interface GetCardDetails {
    _id: string;
    Card_name: string;
    card_number: string;
    cvv: string;
    expire_date: string;
    card_type: string;
    user_id: string;
    created_date: string;
    is_primary: string
}

export interface Role {
    name: string;
    scopes: Scope[];
}

export interface ILoginUserData {
    _id: string;
    username: string;
    email: string;
    country: string;
    profile_photo: string;
    IS_BLOCKED: string;
    phone_number: string;
    Company: string;
    Language: string;
    INVITE_ASSIGN: number;
    created_date: string;
    role: Role;
    modified_date: string;
}

export interface updatedData {
    username: string;
    Company: string;
    email: string;
    country: string;
    phone_number: string;
    Language: string;
}

export interface IupdatedObject {
    username: string;
    Company: string;
    email: string;
    country: string;
    phone_number: string;
    Language: string;
}
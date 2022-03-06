export interface contactFixingFields {
    country: string,
    city: string,
    postal: string,
    fixing: string
}

export interface mainColumns {
    name: string;
    duplicate: number;
    unique: number;
    is_active: boolean;
}

export interface subColumns {
    column: string;
    value: string;
    csv: number;
    registry: number;
    active: boolean;
}
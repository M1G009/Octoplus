export interface AddNewFiled {
    column: string;
    dtype: string;
}

export interface ReplaceData {
    replace_from: string,
    replace_to: string,
    column: string
}

export interface DynamicFields {
    [key: string]: {
        type: string,
        options: []
    }
}

export interface columnsHideShowFileds {
    [key: string]: boolean
}

export interface TableColumns {
    id: Number,
    name: String,
    editedName: String,
    hide: Boolean,
    readonly: Boolean
}

export interface CSVUpload {
    file: any
}
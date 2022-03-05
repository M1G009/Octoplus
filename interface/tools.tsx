export interface NewCompareFields {
    compare_name: string,
    registry: string,
    csv_file: any,
    csv_name: string
}

export interface AddNewFiled {
    column: string;
    dtype: string;
}

export interface WorkProgress {
    complete: number;
    progress: number;
    ignored: number;
}

export interface compareData {
    _id: string;
    compare_name: string;
    csv_name: string;
    work_progress: WorkProgress;
    is_active: string;
    total_rows: number;
    fixed: number;
}
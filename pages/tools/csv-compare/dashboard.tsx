// React Module Imports
import React, { useEffect, useState } from 'react'
// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'

// Prime React Imports
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';

// 3rd Party Imports
import { ToastContainer } from "react-toastify";
import { FaRegEdit, FaRegSave } from "react-icons/fa";
import { Formik, FieldArray, FormikHelpers } from 'formik';
import { BsExclamationCircleFill } from "react-icons/bs";
import toast from "../../../components/Toast";

// Style and Component Imports
import layoutStyles from '../../../styles/Home.module.scss';
import styles from '../../../styles/product.module.scss';
import { withProtectSync } from "../../../utils/protect"
import DashboardLayout from '../../../components/DashboardLayout';

// Interface/Helper Imports
import service from '../../../helper/api/api';

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

export interface DynamicFields {
    [key: string]: any;
}

const CsvCompare: NextPage = (props: any) => {
    const router = useRouter();
    const { query } = router;
    const [assignContactFixingModal, setAssignContactFixingModal] = useState(false);
    const [contactFixingSpinner, setContactFixingSpinner] = useState(false);
    const [dataType, setDataType] = useState(["text", "email", "date", "number", "textarea", "checkbox"]);
    const [saveContactModal, setSaveContactModal] = useState(false);
    const [mainColumns, setMainColumns] = useState<mainColumns[]>([]);
    const [csvId, setCsvId] = useState<any>('');
    const [subColumns, setSubColumns] = useState<subColumns[]>([]);
    const [subActiveColumnValue, setSubActiveColumnValue] = useState<any>('');
    const [registryEntriesCopy, setRegistryEntriesCopy] = useState<any[]>([]);
    const [registryEntries, setRegistryEntries] = useState<any[]>([]);
    const [csvEntries, setCsvEntries] = useState<any[]>([]);
    const [mergeEntries, setMergeEntries] = useState<any>('');
    const [mergeEntriesDis, setMergeEntriesDis] = useState(true);
    const [currentColumn, setCurrentColumn] = useState('');
    const [activeColumn, setactiveColumn] = useState('');
    const [dashBoardSpinner, setDashBoardSpinner] = useState(false);
    const [editFieldStatus, setEditFieldStatus] = useState(false);
    const [registryId, setRegistryId] = useState('');
    const [searchVal, setSearchVal] = useState('');
    const [assignFiltersData, setAssignFiltersData] = useState<DynamicFields>({})
    const [initialAssignFiltersData, setInitialAssignFiltersData] = useState<DynamicFields>({})
    const [assignFilterModalSpinner, setAssignFilterModalSpinner] = useState(false);
    const [assignContactModalSpinner, setAssignContactModalSpinner] = useState(false);
    const [mergeCheck, setMergeCheck] = useState(false);
    const [mergeBtnToggle, setMergeBtnToggle] = useState(false)

    const fetchSubColumnDataRecord = async (columnName: any, columnValue: any, csv_id: any) => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }
            setDashBoardSpinner(true);

            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/csvdash3`,
                method: 'POST',
                data: JSON.stringify({ "column": columnName, "value": columnValue, csv_id }),
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });
            
            if (data.data) {
                setRegistryEntries(data.data.registry)
                setRegistryEntriesCopy(data.data.registry)
                setCsvEntries(data.data.csv)
                setMergeEntries(data.data.registry[0])
                setRegistryId(data.data.registry_id)
            } else {
                setRegistryEntries([])
                setRegistryEntriesCopy([])
                setCsvEntries([])
            }
            setMergeBtnToggle(false)
            setDashBoardSpinner(false);

        } catch (err) {
            setRegistryEntries([])
            setRegistryEntriesCopy([])
            setCsvEntries([])
            setDashBoardSpinner(false);
            return await toast({ type: "error", message: err });
        }
    }

    const fetchSubColumnsRecord = async (columnName: any, csv_id: any, ignore = false) => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }

            setDashBoardSpinner(true);

            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/csvdash2`,
                method: 'POST',
                data: JSON.stringify({ "column": columnName, csv_id }),
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });

            if (data.data.length) {
                let activeVal = '';
                let newArray;

                if (!subActiveColumnValue.value || columnName != activeColumn) {
                    newArray = data.data.map((obj: any, i: number) => {
                        if (i == 0) {
                            activeVal = obj.value;
                            setSubActiveColumnValue(obj)
                            return { ...obj, "active": true }
                        } else {
                            return { ...obj, "active": false }
                        }
                    })
                } else {
                    newArray = data.data.map((obj: any, i: number) => {
                        if (!ignore) {
                            if (obj.value == subActiveColumnValue.value) {
                                activeVal = obj.value;
                                setSubActiveColumnValue(obj)
                                return { ...obj, "active": true }
                            } else {
                                return { ...obj, "active": false }
                            }
                        } else {
                            if (i == 0) {
                                activeVal = obj.value;
                                setSubActiveColumnValue(obj)
                                return { ...obj, "active": true }
                            } else {
                                return { ...obj, "active": false }
                            }
                        }

                    })
                }

                setSubColumns(newArray);
                if (activeVal) {
                    await fetchSubColumnDataRecord(columnName, activeVal, csv_id)
                }
                setDashBoardSpinner(false);
            } else {
                setDashBoardSpinner(false);
                setRegistryEntries([])
                setRegistryEntriesCopy([])
                setCsvEntries([])
                return await toast({ type: "error", message: "No record found" });
            }


        } catch (err) {
            setDashBoardSpinner(false);
            return await toast({ type: "error", message: err });
        }
    }

    const fetchAllColumnsRecord = async (csv_id: any, ignore = false) => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }
            setDashBoardSpinner(true);
            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/csvdash1`,
                method: 'POST',
                data: JSON.stringify({ csv_id }),
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });

            if (data.status == "400") {
                setDashBoardSpinner(false);
                return await toast({ type: "error", message: data.message });
            }

            if (data.data.length) {
                let allData = data.data[0];
                let checkActive: any = Object.keys(allData).find(el => allData[el].duplicate > 0)

                let newArray: any = [];

                if (!activeColumn) {
                    Object.keys(allData).map((name, i) => {
                        if (checkActive) {
                            if (name == checkActive) {
                                setactiveColumn(name)
                                return newArray.push({ name, ...allData[name], is_active: true })
                            } else {
                                return newArray.push({ name, ...allData[name], is_active: false })
                            }
                        }
                    })

                    setCurrentColumn(checkActive);
                } else {
                    Object.keys(allData).map((name, i) => {
                        if (name == activeColumn) {
                            setactiveColumn(name)
                            return newArray.push({ name, ...allData[name], is_active: true })
                        } else {
                            return newArray.push({ name, ...allData[name], is_active: false })
                        }
                    })
                }

                setMainColumns(newArray);

                if (ignore) {
                    if (activeColumn) {
                        await fetchSubColumnsRecord(activeColumn, csv_id, true)
                    } else {
                        await fetchSubColumnsRecord(checkActive, csv_id, true)
                    }
                } else {
                    if (activeColumn) {
                        await fetchSubColumnsRecord(activeColumn, csv_id)
                    } else {
                        await fetchSubColumnsRecord(checkActive, csv_id)
                    }
                }

                setDashBoardSpinner(false);
            } else {
                setDashBoardSpinner(false);

                return await toast({ type: "error", message: "No record found" });
            }


        } catch (err) {
            setDashBoardSpinner(false);
            return await toast({ type: "error", message: err });
        }
    }


    useEffect(() => {
        async function checkQuery() {
            if (window.location.href) {
                const urlSearchParams = new URLSearchParams(window.location.search)
                let id = urlSearchParams.get('id')

                if (!id) return router.push('/tools/csv-compare');
                if (id) {
                    setCsvId(id)
                    await fetchAllColumnsRecord(id, false)
                }
            }
        }
        checkQuery();

    }, [])

    const contactFixingHandler = async (getData: any) => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }
            setAssignFilterModalSpinner(true)
            let getDataCopy = { ...getData };

            Object.keys(getDataCopy).map(el => {
                if (!getDataCopy[el]) {
                    delete getDataCopy[el];
                }
            })

            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/assigning?csv_id=${csvId}&filter=${JSON.stringify(getDataCopy)}`,
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });
            await fetchAllColumnsRecord(csvId)
            setAssignFilterModalSpinner(false)
            setAssignContactFixingModal(false)
        } catch (err) {
            setAssignFilterModalSpinner(false)
            return await toast({ type: "error", message: err });
        }
    }

    const mergeColumnCheckHandler = (value: any, name: any) => {
        setMergeEntriesDis(false);
        setMergeEntries((prevState: any) => ({ ...prevState, [name]: value }))
        setTimeout(() => setMergeEntriesDis(true), 1)
    }

    const mainColumnActiveHandler = async (name: string) => {
        if (name != activeColumn) {
            setSubActiveColumnValue('')
            await fetchSubColumnsRecord(name, csvId)
            let copyMainColumns: any = [...mainColumns].map((el: any) => {
                if (el.name == name) {
                    let copyEl = { ...el };
                    copyEl.is_active = true
                    return copyEl
                } else {
                    let copyEl = { ...el };
                    copyEl.is_active = false
                    return copyEl
                }
            });

            setMainColumns(copyMainColumns);
            setactiveColumn(name);
        }
    }

    const subColumnActiveHandler = async (value: string) => {
        if (value != activeColumn) {
            await fetchSubColumnDataRecord(activeColumn, value, csvId)
            let copySubColumns: any = [...subColumns].map((el: any) => {
                if (el.value == value) {
                    let copyEl = { ...el };
                    copyEl.active = true
                    return copyEl
                } else {
                    let copyEl = { ...el };
                    copyEl.active = false
                    return copyEl
                }
            });
            setSubColumns(copySubColumns);
            let copySubActiveColumnValue = { ...subActiveColumnValue };
            if (copySubActiveColumnValue.value) {
                copySubActiveColumnValue.value = value
                setSubActiveColumnValue(copySubActiveColumnValue);
            }
        }
    }

    const registryColumnEditHandler = (key: any, value: any, index: number) => {
        let copyarray: any = registryEntries.slice();
        let copyObj: any = copyarray[index];
        copyObj[key] = value
        copyarray[index] = copyObj;
        setRegistryEntries(copyarray);
    }

    const assignContactModalHandler = async () => {
        try {
            setAssignContactFixingModal(true);

            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }
            setAssignContactModalSpinner(true)
            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/GETfilters`,
                method: 'POST',
                data: JSON.stringify({ csv_id: csvId }),
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });
            let copyObj = { ...data.data[0] };
            copyObj['users'].map((el: any, i: number) => copyObj['users'][i] = el.user_id)
            let newObj: any = {};

            Object.keys(copyObj).map(el => {
                if (copyObj[el][0]) {
                    return newObj[el] = copyObj[el][0]
                }
            })

            let filterDatas = {...data.data[0]}
            Object.keys(filterDatas).map((key: any) => {
                let newArray: any = [];
                filterDatas[key].map((el: any) => {
                    if(el && el != "0" && el != "Null" && el != "null"){
                        return newArray.push(el)
                    }
                })

                if(newArray.length){
                    return filterDatas[key] = newArray;
                } else {
                    delete filterDatas[key]
                }
            })
            
            
            setAssignFiltersData(filterDatas);
            setInitialAssignFiltersData(newObj);
            setAssignContactModalSpinner(false)

        } catch (err) {
            setAssignContactModalSpinner(false)
            return await toast({ type: "error", message: err });
        }
    }

    const mergeColumnHandler = async () => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }
            let query;
            if (mergeCheck) {
                query = { "registry": registryEntriesCopy, "csv": csvEntries, "csv_id": csvId, "registry_id": registryId, "merge": mergeEntries }
            } else {
                query = { "registry": registryEntriesCopy, "csv": csvEntries, "csv_id": csvId, "registry_id": registryId, "ignored": mergeEntries }
                setactiveColumn('');
            }

            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/merge`,
                method: 'POST',
                data: JSON.stringify(query),
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });

            setSubActiveColumnValue('');
            setSaveContactModal(false)
            await fetchAllColumnsRecord(csvId, true)

        } catch (err) {
            setSaveContactModal(false)
            return await toast({ type: "error", message: err });
        }
    }

    const ignoreMappingDialogHandler = async () => {
        confirmDialog({
            message: 'Are you sure you want to ignore?',
            header: 'Ignore Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => mergeColumnHandler()
        });
    }

    const assignContactCloseHandler = (e: any) => {
        if (e.target.classList.contains("p-dialog-mask")) {
            setAssignContactFixingModal(false)
        }
    }

    const saveContactCloseHandler = (e: any) => {
        if (e.target.classList.contains("p-dialog-mask")) {
            setSaveContactModal(false)
        }
    }

    return (
        <DashboardLayout sidebar={false}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className={layoutStyles.topBar}>
                <div className='p-d-flex p-ai-center p-jc-between'>
                    <div>
                        <p className={styles.breadcrumButtons}><Link href="/tools/csv-compare">CSV Compare</Link> / <span>Dashboard</span></p>
                        <h5>Dashboard</h5>
                    </div>
                </div>
            </div>
            <div className={layoutStyles.box}>
                <div className={layoutStyles.headContentBox}>
                    <div className={layoutStyles.textBox}>
                        <div className={'p-d-flex p-flex-column p-flex-md-row ' + styles.dashboardContainer}>
                            {
                                dashBoardSpinner ? <div className={styles.formSpinner}>
                                    <div className={styles.loading}></div>
                                </div> : null
                            }
                            <div className={styles.columnsBox}>
                                {
                                    mainColumns && mainColumns.length ?
                                        mainColumns.map((el, i) => {
                                            if (el.duplicate == 0) {
                                                return <button key={"mainColumns" + i} className={styles.columnText} disabled>
                                                    <h6>{el.name}</h6>
                                                    <p><span className={styles.deblicateData}>({el.duplicate} duplicates)</span><span>•</span><span className={styles.unique}>({el.unique} are unique)</span></p>
                                                </button>
                                            }
                                            if (el.is_active) {
                                                return <button key={"mainColumns" + i} className={styles.columnText + " " + styles.active} onClick={() => mainColumnActiveHandler(el.name)}>
                                                    <h6>{el.name}</h6>
                                                    <p><span className={styles.deblicateData}>({el.duplicate} duplicates)</span><span>•</span><span className={styles.unique}>({el.unique} are unique)</span></p>
                                                </button>
                                            } else {
                                                return <button key={"mainColumns" + i} className={styles.columnText} onClick={() => mainColumnActiveHandler(el.name)}>
                                                    <h6>{el.name}</h6>
                                                    <p><span className={styles.deblicateData}>({el.duplicate} duplicates)</span><span>•</span><span className={styles.unique}>({el.unique} are unique)</span></p>
                                                </button>
                                            }
                                        })
                                        :
                                        ""
                                }
                            </div>
                            <div className={styles.singleColumnBox}>
                                <div className={"p-inputgroup " + styles.searchInput}>
                                    <InputText placeholder="Search..." value={searchVal} onChange={(e) => setSearchVal(e.target.value)} />
                                    <Button icon="pi pi-search" />
                                </div>
                                <div className={styles.searchContentBox}>
                                    {
                                        subColumns && subColumns.length ?
                                            subColumns.filter((el) => {
                                                if (searchVal) {
                                                    return el.value.toLowerCase().includes(searchVal);
                                                } else {
                                                    return true;
                                                }
                                            }).map((el, i) => {
                                                if (el.value || el.value == "0") {
                                                    if (el.active) {
                                                        return <button key={"subcolumns" + i} className={styles.columnText + " " + styles.active} onClick={() => subColumnActiveHandler(el.value)}>
                                                            <h6>{el.value}</h6>
                                                            <p>{el.registry} in Registry, {el.csv} in CSV</p>
                                                        </button>
                                                    } else {
                                                        return <button key={"subcolumns" + i} className={styles.columnText} onClick={() => subColumnActiveHandler(el.value)}>
                                                            <h6>{el.value}</h6>
                                                            <p>{el.registry} in Registry, {el.csv} in CSV</p>
                                                        </button>
                                                    }
                                                }
                                            })
                                            :
                                            ""
                                    }
                                </div>
                            </div>
                            <div className={styles.detailsBox + " customCheckBox"}>
                                <div className={styles.textBox}>
                                    <div className={styles.headBox + " p-d-flex p-ai-center p-jc-between"}>
                                        <div className={styles.columnHead}>
                                            <div className='p-d-flex p-ai-center p-mb-3'>
                                                <h4>{subActiveColumnValue.value}</h4>
                                                <p className='p-ml-2'>{subActiveColumnValue.registry} Registry, {subActiveColumnValue.csv} CSV</p>
                                            </div>
                                            <p className={styles.text}>Kindly select below data to perform desire action</p>
                                        </div>
                                        {
                                            registryEntries && registryEntries.length && csvEntries && csvEntries.length ?
                                                <button className={layoutStyles.customBluebtn} onClick={() => assignContactModalHandler()} >Assign Contact Fixing</button>
                                                : ""
                                        }
                                    </div>
                                    {
                                        mergeEntriesDis ?
                                            <div className={styles.bottomBox}>
                                                <div className={styles.titleText}>
                                                    <h6>
                                                        Registry Database
                                                    </h6>
                                                </div>
                                                <div className={styles.dataBox + " customDashboardRadio " + styles.registryDataBox}>
                                                    <div className='p-mx-3'>
                                                        {
                                                            registryEntries && registryEntries.length && subActiveColumnValue && subActiveColumnValue.value ?
                                                                registryEntries.map((obj, i) => {
                                                                    let keys: any = Object.keys(obj);
                                                                    return <div key={"registryEntries" + i} className={styles.registryPaddingBox}>
                                                                        {
                                                                            keys.map((el: string, index: number) => {
                                                                                if (activeColumn == el) {
                                                                                    return <div key={"csvdata" + i} className='p-d-flex p-ai-center p-mb-2 uniqueRegistryColumn'>
                                                                                        <RadioButton className='p-mr-1' value={obj[el]} name={el} checked={obj[el] == mergeEntries[el]} onChange={(e) => mergeColumnCheckHandler(e.target.value, e.target.name)} />
                                                                                        <label htmlFor="">{el}</label>
                                                                                        <p>{obj[el] == "null" ? '' : obj[el]}</p>
                                                                                    </div>
                                                                                }
                                                                                return <div key={"registrydata" + index} className='p-d-flex p-ai-center p-mb-2'>
                                                                                    <RadioButton className='p-mr-1' value={obj[el]} name={el} checked={obj[el] == mergeEntries[el]} onChange={(e) => mergeColumnCheckHandler(e.target.value, e.target.name)} />
                                                                                    <label htmlFor="">{el}</label>
                                                                                    {
                                                                                        !editFieldStatus ?
                                                                                            <p>{obj[el] == "null" ? '' : obj[el]}</p>
                                                                                            :
                                                                                            <input type="text" name={el} value={obj[el]} onChange={(e) => registryColumnEditHandler(el, e.target.value, i)} />
                                                                                    }
                                                                                </div>
                                                                            })
                                                                        }
                                                                    </div>
                                                                })
                                                                : "No registry data found"
                                                        }
                                                    </div>
                                                    {
                                                        subActiveColumnValue && subActiveColumnValue.value ?
                                                            !editFieldStatus ?
                                                                <button className={layoutStyles.blueTextBtn + " p-ml-auto p-as-start p-d-flex " + styles.columnEditBtn} onClick={() => setEditFieldStatus(true)}><FaRegEdit className='p-mr-1' />Edit</button>
                                                                :
                                                                <button className={layoutStyles.blueTextBtn + " p-ml-auto p-as-start p-d-flex"} onClick={() => setEditFieldStatus(false)}><FaRegSave className='p-mr-1' />Save</button>
                                                            : ""
                                                    }
                                                </div>
                                                <div className={styles.titleText}>
                                                    <h6>
                                                        CSV File Data
                                                    </h6>
                                                </div>
                                                <div className={styles.dataBox + " customDashboardRadio " + styles.csvDataBox}>
                                                    {
                                                        csvEntries && csvEntries.length && subActiveColumnValue && subActiveColumnValue.value && registryEntries && registryEntries.length ?
                                                            csvEntries.map((obj, i) => {
                                                                let keys: any = Object.keys(obj);
                                                                return <div className='p-mx-3' key={"csvdatas" + i}>
                                                                    {
                                                                        keys.map((el: any, i: number) => {
                                                                            if (obj[el] != registryEntries[0][el] && obj[el]) {
                                                                                {
                                                                                    !mergeBtnToggle ?
                                                                                        setMergeBtnToggle(true)
                                                                                        : ""
                                                                                }
                                                                                return <div key={"csvdata" + i} className='p-d-flex p-ai-center p-mb-2'>
                                                                                    <RadioButton className='p-mr-1' value={obj[el]} name={el} checked={obj[el] == mergeEntries[el]} onChange={(e) => mergeColumnCheckHandler(e.target.value, e.target.name)} />
                                                                                    <label htmlFor="">{el}</label>
                                                                                    <p>{obj[el]}</p>
                                                                                </div>
                                                                            }
                                                                            else {
                                                                                if (activeColumn == el) {

                                                                                    return <div key={"csvdata" + i} className='p-d-flex p-ai-center p-mb-2 duplicatesColumnId'>
                                                                                        <RadioButton className='p-mr-1' value={obj[el]} name={el} checked={obj[el] == mergeEntries[el]} disabled={true} />
                                                                                        <label htmlFor="">{el}</label>
                                                                                        <p>{obj[el]}</p>
                                                                                    </div>
                                                                                } else {

                                                                                    return <div key={"csvdata" + i} className='p-d-flex p-ai-center p-mb-2'>
                                                                                        <RadioButton className={'p-mr-1 duplicateBtn'} value={obj[el]} name={el} checked={obj[el] == mergeEntries[el]} disabled={true} />
                                                                                        <label htmlFor="">{el}</label>
                                                                                        <p>{obj[el]}</p>
                                                                                    </div>
                                                                                }

                                                                            }
                                                                        })
                                                                    }
                                                                </div>
                                                            })
                                                            : <p>No CSV data found</p>
                                                    }
                                                </div>
                                            </div> : ''
                                    }
                                </div>
                                <div className="p-mt-3 p-text-right">
                                    {
                                        registryEntries && registryEntries.length && csvEntries && csvEntries.length ?
                                            <button type='button' className={layoutStyles.customDarkBgbtn} onClick={() => { setMergeCheck(false); ignoreMappingDialogHandler() }} >Ignore</button>
                                            : ""
                                    }
                                    {
                                        mergeBtnToggle ?
                                            <button type='button' onClick={() => { setMergeCheck(true); setSaveContactModal(true) }} className={layoutStyles.customBlueBgbtn}>Merge</button>
                                            : ""
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Contact Fixing-Modal */}
            <Dialog showHeader={false} onMaskClick={assignContactCloseHandler} contentClassName={styles.modelsCustomStyles} maskClassName={styles.dialogMask} visible={assignContactFixingModal} style={{ width: '500px', }} onHide={() => ''}>
                <div className={styles.replaceDataModal}>
                    {
                        assignContactModalSpinner ? <div className={styles.formSpinner}>
                            <div className={styles.loading}></div>
                        </div> : null
                    }
                    <h5>Assign Contact Fixing</h5>
                    <Formik
                        enableReinitialize={true}
                        initialValues={initialAssignFiltersData}
                        onSubmit={(
                            values: DynamicFields,
                            { setSubmitting }: FormikHelpers<DynamicFields>
                        ) => {
                            contactFixingHandler(values);
                            setSubmitting(false);
                        }}
                    >
                        {props => (
                            <form onSubmit={props.handleSubmit}>
                                <FieldArray
                                    name="contact"
                                    render={arrayHelpers => (
                                        <div className={styles.inputFields + " " + styles.contactFixingModal}>
                                            {
                                                assignFilterModalSpinner ? <div className={styles.formSpinner}>
                                                    <div className={styles.loading}></div>
                                                </div> : null
                                            }
                                            {
                                                Object.keys(props.values).map(function (key, index) {
                                                    return <div className={styles.inputBox} key={"assignFilterModal" + index}>
                                                        <label htmlFor={key}>{key}</label>
                                                        <Dropdown id={key} className={styles.selectBox} name={key} value={props.values[key]} options={assignFiltersData[key]} onChange={(e: any) => props.setFieldValue(key, e.target.value)} />
                                                    </div>
                                                })
                                            }
                                        </div>
                                    )}
                                />
                                <div className="p-d-flex p-ai-center p-my-3">
                                    <div className="p-m-auto">
                                        <button type='submit' className={layoutStyles.customBlueBgbtn}>Assign</button>
                                        <button type='button' onClick={() => setAssignContactFixingModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Dialog>

            {/* Save Contact Details Modal */}
            <Dialog showHeader={false} onMaskClick={saveContactCloseHandler} contentClassName={styles.modelsCustomStyles} maskClassName={styles.dialogMask} visible={saveContactModal} style={{ width: '500px', }} onHide={() => ''}>
                <div className={styles.replaceDataModal}>
                    <h5>Save Contact Details</h5>
                    <div className={styles.contactDetails}>
                        <div className={styles.textBox}>
                            <BsExclamationCircleFill />
                            <p>
                                Merging the duplicates will replace the current contact data. Do you want to save a copy of the current data?
                            </p>
                        </div>
                        <div className='p-mt-4'>
                            <button className={layoutStyles.customBluebtn} onClick={() => mergeColumnHandler()}>Yes, save a copy</button>
                            <button className={layoutStyles.customBlueBgbtn} onClick={() => mergeColumnHandler()}>Replace current data</button>
                        </div>
                    </div>
                </div>
            </Dialog>

        </DashboardLayout>
    )
}

export default withProtectSync(CsvCompare)

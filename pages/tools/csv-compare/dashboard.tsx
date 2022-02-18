// React Module Imports
import React, { useEffect, useState } from 'react'
// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import slugify from 'slugify'

// Prime React Imports
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';

// 3rd Party Imports
import * as yup from 'yup';
import { FaRegEdit, FaRegSave } from "react-icons/fa";
import { ErrorMessage, Formik, FieldArray, Field, FormikHelpers } from 'formik';
import { BsExclamationCircleFill } from "react-icons/bs";
import toast from "../../../components/Toast";

// Style and Component Imports
import layoutStyles from '../../../styles/Home.module.scss';
import styles from '../../../styles/product.module.scss';
import { withProtectSync } from "../../../utils/protect"
import DashboardLayout from '../../../components/DashboardLayout';

// Interface/Helper Imports
import service from '../../../helper/api/api';
import { object } from 'yup/lib/locale';

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
    const [searchVal, setSearchVal] = useState('')
    const [assignFiltersData, setAssignFiltersData] = useState<DynamicFields>({
        "id": [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            24,
            25,
            26,
            27,
            28,
            29,
            30,
            31
        ],
        "First Name": [
            "a",
            "ab",
            "abc"
        ],
        "Last Name": [
            0.0
        ],
        "Email Address": [
            "a@gmail.com",
            "ab@gmail.com",
            "abc@gmail.com"
        ],
        "Married": [
            "FALSE",
            "TRUE",
            "0"
        ],
        "Pincode": [
            385004.0,
            0.0,
            385007.0,
            221007.0,
            7234101.0,
            433.0
        ],
        "Middle name": [
            "tst",
            0,
            "hello",
            "Kr",
            "maria",
            "0"
        ],
        "last": [
            0,
            "helloing 0",
            "0",
            "Perone",
            "Jaiswal"
        ],
        "Price": [
            50.0,
            100.0,
            40.0,
            10.0,
            5000.0,
            100000.0,
            0.0,
            1230000.0,
            1.0
        ],
        "pet name": [
            0,
            "OScar",
            "0"
        ],
        "users": [
            {
                "username": "Suryanshtest2",
                "user_id": "61c0a0df7fbfa877fb2340aa"
            }
        ]
    })
    const [initialAssignFiltersData, setInitialAssignFiltersData] = useState<DynamicFields>({
        "id": 1,
        "First Name": "a",
        "Last Name": 0.0,
        "Email Address": "a@gmail.com",
        "Married": "FALSE",
        "Pincode": 385004.0,
        "Middle name": "tst",
        "last": "Perone",
        "Price": 50.0,
        "pet name": 0
    })
    const [assignFilterModalSpinner, setAssignFilterModalSpinner] = useState(false);

    const contactFixingSchema = yup.object().shape({
        compare_name: yup.string().required('Please enter Select data'),
        registry: yup.string().required('Please enter Change to'),
        csv_file: yup.string().required('Please upload CSV file'),
        csv_name: yup.string().required('Please enter csv name')
    });


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
            }
            setDashBoardSpinner(false);

        } catch (err) {
            setDashBoardSpinner(false);
            return await toast({ type: "error", message: err });
        }
    }

    const fetchSubColumnsRecord = async (columnName: any, csv_id: any) => {
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
                
                let newArray = data.data.map((obj: any, i: number) => {
                    if (!subActiveColumnValue.value) {
                        if (i == 0) {
                            activeVal = obj.value;
                            setSubActiveColumnValue(obj)
                            return { ...obj, "active": true }
                        } else {
                            return { ...obj, "active": false }
                        }
                    } else {
                        if (obj.value == subActiveColumnValue.value) {
                            activeVal = obj.value;
                            setSubActiveColumnValue(obj)
                            return { ...obj, "active": true }
                        } else {
                            if (i == 0) {
                                activeVal = obj.value;
                                return { ...obj, "active": true }
                            }
                            return { ...obj, "active": false }
                        }
                    }
                })
                setSubColumns(newArray);
                if(activeVal){
                    await fetchSubColumnDataRecord(columnName, activeVal, csv_id)
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

    const fetchAllColumnsRecord = async (csv_id: any) => {
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
            if (data.data.length) {
                let allData = data.data[0];

                let newArray: any = [];
                Object.keys(allData).map((name, i) => {
                    if (!activeColumn) {
                        if (i == 0) {
                            setactiveColumn(name)
                            return newArray.push({ name, ...allData[name], is_active: true })
                        } else {
                            return newArray.push({ name, ...allData[name], is_active: false })
                        }
                    } else {
                        if (name == activeColumn) {
                            setactiveColumn(name)
                            return newArray.push({ name, ...allData[name], is_active: true })
                        } else {
                            return newArray.push({ name, ...allData[name], is_active: false })
                        }
                    }

                })
                setMainColumns(newArray);
                setCurrentColumn(newArray[0].name)
                await fetchSubColumnsRecord(newArray[0].name, csv_id)
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
                    await fetchAllColumnsRecord(id)
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
            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/assigning?csv_id=${csvId}&filter=${JSON.stringify(getData)}`,
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
            // let slug = slugify(name, { replacement: '-', remove: undefined, lower: true, strict: false, locale: 'vi', trim: true });
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
            let slug = slugify(activeColumn, { replacement: '-', remove: undefined, lower: true, strict: false, locale: 'vi', trim: true });
            await fetchSubColumnDataRecord(slug, value, csvId)
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
            let copySubActiveColumnValue = { ...subActiveColumnValue };
            copySubActiveColumnValue.value = value
            setSubColumns(copySubColumns);
            setSubActiveColumnValue(copySubActiveColumnValue);
        }
    }

    const registryColumnEditHandler = (key: any, value: any, index: number) => {
        let copyarray: any = registryEntries.slice();
        let copyObj: any = copyarray[index];
        copyObj[key] = value
        copyarray[index] = copyObj;
        setRegistryEntries(copyarray);
    }

    const assignContactModalHandler = () => {
        setAssignContactFixingModal(true)
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
            console.log(JSON.stringify({ "registry": registryEntriesCopy, "csv": csvEntries, "csv_id": csvId, "registry_id": registryId, "merge": mergeEntries}));
            console.log({ "registry": registryEntriesCopy, "csv": csvEntries, "csv_id": csvId, "registry_id": registryId, "merge": mergeEntries});
            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/merge`,
                method: 'POST',
                data: JSON.stringify({ "registry": registryEntriesCopy, "csv": csvEntries, "csv_id": csvId, "registry_id": registryId, "merge": mergeEntries}),
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });
            console.log(data);
            
            setSaveContactModal(false)
            setSubActiveColumnValue('');
            await fetchAllColumnsRecord(csvId)

        } catch (error) {
            setSaveContactModal(false)
            console.log(error);
        }
    }

    return (
        <DashboardLayout sidebar={false}>
            <div className={layoutStyles.topBar}>
                <div className='p-d-flex p-ai-center p-jc-between'>
                    <div>
                        <p>Tools / CSV Compare / <span>Dashboard</span></p>
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
                                    mainColumns.length ?
                                        mainColumns.map((el, i) => {
                                            if (el.unique == 0 && el.duplicate == 0) {
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
                                        subColumns.length ?
                                            subColumns.filter((el) => {
                                                if(searchVal){
                                                    return el.value == searchVal
                                                } else {
                                                    return true;
                                                }
                                            }).map((el, i) => {
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
                                        <button className={layoutStyles.customBluebtn} onClick={() => assignContactModalHandler()} >Assign Contact Fixing</button>
                                    </div>
                                    {
                                        mergeEntriesDis ?
                                            <div className={styles.bottomBox}>
                                                <div className={styles.titleText}>
                                                    <h6>
                                                        Registry Database
                                                    </h6>
                                                </div>
                                                <div className={styles.dataBox + " " + styles.registryDataBox}>
                                                    <div className='p-mx-3'>
                                                        {                                                            
                                                            registryEntries.length ?
                                                                registryEntries.map((obj, i) => {
                                                                    let keys: any = Object.keys(obj);
                                                                    return keys.map((el: string, index: number) => {
                                                                        if (currentColumn == el) {
                                                                            return <div key={"csvdata" + index} className='p-d-flex p-ai-center p-mb-2'>
                                                                                <RadioButton className='p-mr-1' value={obj[el]} name={el} checked={obj[el] == mergeEntries[el]} disabled={true} />
                                                                                <label htmlFor="">{el}</label>
                                                                                <p>{obj[el]}</p>
                                                                            </div>
                                                                        }
                                                                        return <div key={"registrydata" + index} className='p-d-flex p-ai-center p-mb-2'>
                                                                            <RadioButton className='p-mr-1' value={obj[el]} name={el} checked={obj[el] == mergeEntries[el]} onChange={(e) => mergeColumnCheckHandler(e.target.value, e.target.name)} />
                                                                            <label htmlFor="">{el}</label>
                                                                            {
                                                                                !editFieldStatus ?
                                                                                    <p>{obj[el]}</p>
                                                                                    :
                                                                                    <input type="text" name={el} value={obj[el]} onChange={(e) => registryColumnEditHandler(el, e.target.value, i)} />
                                                                            }
                                                                        </div>
                                                                    })
                                                                })
                                                                : "No registry data found"
                                                        }
                                                    </div>
                                                    {
                                                        !editFieldStatus ?
                                                            <button className={layoutStyles.blueTextBtn + " p-ml-auto p-as-start p-d-flex"} onClick={() => setEditFieldStatus(true)}><FaRegEdit className='p-mr-1' />Edit</button>
                                                            :
                                                            <button className={layoutStyles.blueTextBtn + " p-ml-auto p-as-start p-d-flex"} onClick={() => setEditFieldStatus(false)}><FaRegSave className='p-mr-1' />Save</button>
                                                    }
                                                </div>
                                                <div className={styles.titleText}>
                                                    <h6>
                                                        CSV File Data
                                                    </h6>
                                                </div>
                                                {
                                                    csvEntries.length ?
                                                        csvEntries.map((obj, i) => {
                                                            let keys: any = Object.keys(obj);
                                                            return <div key={"csvdatas" + i} className={styles.dataBox + " " + styles.csvDataBox}>
                                                                <div className='p-mx-3'>
                                                                    {
                                                                        keys.map((el: any, i: number) => {
                                                                            if(obj[el] != registryEntries[0][el] && obj[el]){
                                                                                if (currentColumn == el) {
                                                                                    return <div key={"csvdata" + i} className='p-d-flex p-ai-center p-mb-2'>
                                                                                        <RadioButton className='p-mr-1' value={obj[el]} name={el} checked={obj[el] == mergeEntries[el]} disabled={true} />
                                                                                        <label htmlFor="">{el}</label>
                                                                                        <p>{obj[el]}</p>
                                                                                    </div>
                                                                                }
                                                                                return <div key={"csvdata" + i} className='p-d-flex p-ai-center p-mb-2'>
                                                                                    <RadioButton className='p-mr-1' value={obj[el]} name={el} checked={obj[el] == mergeEntries[el]} onChange={(e) => mergeColumnCheckHandler(e.target.value, e.target.name)} />
                                                                                    <label htmlFor="">{el}</label>
                                                                                    <p>{obj[el]}</p>
                                                                                </div>
                                                                            }
                                                                        })
                                                                    }
                                                                </div>
                                                            </div>
                                                        })
                                                        : <p className='p-p-2 p-m-0'>No CSV data found</p>
                                                }
                                            </div> : ''
                                    }
                                </div>
                                <div className="p-mt-3 p-text-right">
                                    <button type='button' className={layoutStyles.customDarkBgbtn}>Ignore</button>
                                    <button type='button' onClick={() => setSaveContactModal(true)} className={layoutStyles.customBlueBgbtn}>Merge</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Contact Fixing-Modal */}
            <Dialog showHeader={false} contentClassName={styles.modelsCustomStyles} maskClassName={styles.dialogMask} visible={assignContactFixingModal} style={{ width: '500px', }} onHide={() => ''}>
                <div className={styles.replaceDataModal}>
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
                                                    if (key == "users") {
                                                        return false
                                                    }
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
            <Dialog showHeader={false} contentClassName={styles.modelsCustomStyles} maskClassName={styles.dialogMask} visible={saveContactModal} style={{ width: '500px', }} onHide={() => ''}>
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

// React Module Imports
import React, { useEffect, useState } from 'react'
// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

// Prime React Imports
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';

// 3rd Party Imports
import * as yup from 'yup';
import { AiOutlineSwap } from "react-icons/ai";
import { MdCompare } from "react-icons/md";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { ErrorMessage, Formik, FieldArray, Field, FormikHelpers } from 'formik';
import { ToastContainer } from "react-toastify";
import { FiUpload, FiPlus } from 'react-icons/fi';
import { confirmDialog } from 'primereact/confirmdialog';
import toast from "../../../components/Toast";
import DragSwap from '../../../components/DragSwap'

// Style and Component Imports
import CustomPagination from '../../../components/CustomPagination'
import layoutStyles from '../../../styles/Home.module.scss';
import styles from '../../../styles/product.module.scss';
import { withProtectSync } from "../../../utils/protect"
import DashboardLayout from '../../../components/DashboardLayout';
import MultiProgressBar from '../../../components/MultiProgressBar';

// Interface/Helper Imports
import service from '../../../helper/api/api';

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
    complate: number;
    progress: number;
    ignored: number;
}

export interface compareData {
    _id: string;
    compare_name: string;
    csv_name: string;
    work_progress: WorkProgress;
    is_active: string
}

export interface DynamicFields {
    [key: string]: string
}

{/* add field button */ }
const CsvCompare: NextPage = (props: any) => {
    const router = useRouter();
    const { query } = router;
    const [compareCsvTableSpinner, setCompareCsvTableSpinner] = useState(false)
    const [newCompareModal, setNewCompareModal] = useState(false);
    const [newCompareDataSpinner, setNewCompareDataSpinner] = useState(false)
    const [dataType, setDataType] = useState([])
    const [mappingTableData, setMapppingTabledata] = useState([
        {
            registry: "Name",
            csv: "Name",
            type: "text",
        },
        {
            registry: "Email",
            csv: "Email",
            type: "email",
        },
        {
            registry: "Phone",
            csv: "Phone",
            type: "number",
        },
        {
            registry: "LinkedIn",
            csv: "",
            type: "text",
        }
    ])
    const [mappingRegistryColumn, setMappingRegistryColumn] = useState<DynamicFields>()
    const [mappingRegistryColumnIndex, setMappingRegistryColumnIndex] = useState<any>([])
    const [mappingCsvColumn, setMappingCsvColumn] = useState<any>([])
    const [csvId, setCsvId] = useState('')

    // Pagination States
    const [compareData, setCompareData] = useState<compareData[]>([])
    const [totalRecords, setTotalRecords] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [columnMappingModal, setColumnMappingModal] = useState(false)
    const [addNewFieldModal, setAddNewFieldModal] = useState(false);
    const [addFiledSpinner, setAddFiledSpinner] = useState(false);

    const newCompareSchema = yup.object().shape({
        compare_name: yup.string().required('Please enter Select data'),
        registry: yup.string().required('Please enter Change to'),
        csv_file: yup.mixed().required("Please upload CSV file").test("type", "Only CSV format is accepted", (value) => {
            return value && (
                value.type === "application/vnd.ms-excel"
            );
        }),
        csv_name: yup.string().required('Please enter csv name')
    });

    const validationSchema = yup.object().shape({
        column: yup.string().required('Please field name')
    });

    const fetchAllCompareRecord = async (page: number, limit: number) => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }
            setCompareCsvTableSpinner(true)
            let query = `page=${page}&limit=${limit}`;

            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/get_csv?${query}`,
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });

            // const res = await service({
            //     url: `https://octoplusapi.herokuapp.com/columnmapGET`,
            //     method: 'POST',
            //     data: JSON.stringify({ csv_id: "620c6f98625a31d79f3fdd76" }),
            //     headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            // });

            // if (res.data) {
            //     let registryColumns = { ...res.data.data[0].registry[0].dtypes };
            //     let csvColumns = { ...res.data.data[0].csv[0].dtypes };
            //     let csvColumnsArray: any = Object.keys(csvColumns);
            //     if (Object.keys(registryColumns).length > Object.keys(csvColumns).length) {
            //         let diff = Object.keys(registryColumns).length - Object.keys(csvColumns).length;
            //         for (let i = 0; i < diff; i++) {
            //             csvColumnsArray.push(null);
            //         }
            //     }
            //     setCsvId("620c6f98625a31d79f3fdd76");
            //     setMappingRegistryColumn(registryColumns)
            //     setMappingCsvColumn(csvColumnsArray)
            //     setDataType(Object.values(registryColumns))
            // } else {
            //     setNewCompareDataSpinner(false);
            // }

            if (!data.data.length) {
                setCompareData([])
                setTotalRecords(0);
            } else {
                setCompareData(data.data[0]);
                setTotalRecords(data.data[0].length);
            }


            setCompareCsvTableSpinner(false)
        } catch (err) {
            setCompareCsvTableSpinner(false)
            return await toast({ type: "error", message: err });
        }
    }


    useEffect(() => {
        async function fetchAllContactData() {
            await fetchAllCompareRecord(currentPage, perPage);
        }
        fetchAllContactData();

    }, [currentPage, perPage])

    const currentPageHandler = (num: number) => {
        setCurrentPage(num);
    }

    const perPageHandler = (num: number) => {
        setCurrentPage(1);
        setPerPage(num);
    }

    const setRegistryColumnTypeHandler = (e: any, index: number) => {
        let mappingdataCopy = [...mappingTableData];
        let objectCopy = mappingdataCopy[index];
        objectCopy.type = e.target.value;
        setMapppingTabledata(mappingdataCopy);
    }

    const csvFileName = (value: any) => {
        if (value) {
            return "File Name:- " + value.name
        }
    }

    const columnMappingGet = async (csv_id: string) => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }

            const res = await service({
                url: `https://octoplusapi.herokuapp.com/columnmapGET`,
                method: 'POST',
                data: JSON.stringify({ csv_id }),
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });
            if (res.data) {
                let registryColumns = { ...res.data.data[0].registry[0].dtypes };
                let csvColumns = { ...res.data.data[0].csv[0].dtypes };
                let csvColumnsArray: any = Object.keys(csvColumns);
                if (Object.keys(registryColumns).length > Object.keys(csvColumns).length) {
                    let diff = Object.keys(registryColumns).length - Object.keys(csvColumns).length;
                    for (let i = 0; i < diff; i++) {
                        csvColumnsArray.push(null);
                    }
                }

                setMappingRegistryColumn(registryColumns)
                setMappingRegistryColumnIndex(Object.keys(registryColumns))
                setMappingCsvColumn(csvColumnsArray)
                setDataType(Object.values(registryColumns))
                setNewCompareDataSpinner(false);
                setColumnMappingModal(true);
            } else {
                setNewCompareDataSpinner(false);
            }
        } catch (err) {
            setNewCompareDataSpinner(false);
        }
    }

    const newCompareSaveHandler = async (getData: any) => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }

            let newCompareForm = new FormData();
            newCompareForm.append('compare_name', getData.compare_name);
            newCompareForm.append('csv', getData.csv_file, getData.name);
            newCompareForm.append('csv_name', getData.csv_name);

            setNewCompareDataSpinner(true);
            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/create_csv`,
                method: 'POST',
                data: newCompareForm,
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': JSON.parse(authToken) }
            });

            if (data.data.length) {
                setCsvId(data.data[0]._id);
                await columnMappingGet(data.data[0]._id)
            } else {
                setNewCompareDataSpinner(false);

            }
        } catch (err) {
            setNewCompareDataSpinner(false);
        }
    }

    const addNewFiledHandler = async (getData: any) => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }

            setAddFiledSpinner(true)
            await service({
                url: `https://octoplusapi.herokuapp.com/add_feild`,
                method: 'POST',
                data: getData,
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });

            setAddFiledSpinner(false)
            setAddNewFieldModal(false)

            return await columnMappingGet(csvId);
        } catch (err) {
            setAddFiledSpinner(false)
            await toast({ type: "error", message: err });
            return setAddNewFieldModal(false)
        }
    }

    const deleteCsvRecordHandler = async (id: String) => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }

            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/delete_csv`,
                method: 'POST',
                data: { "csv_id": id },
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });

            await fetchAllCompareRecord(currentPage, perPage);

        } catch (err) {
            console.log(err);

        }
    }

    const deleteCsvDialogHandler = async (id: String) => {
        confirmDialog({
            message: 'Do you want to delete this comparison record?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteCsvRecordHandler(id)
        });
    }

    const compareCsvDialogHandler = async (id: string, is_active: string) => {
        if (is_active == "Y") {
            return router.push(`/tools/csv-compare/dashboard?id=${id}`);
        }
        setCsvId(id);
        await columnMappingGet(id);
        setColumnMappingModal(true);

    }

    const csvFileUploadHandler = (e: any, setFieldValue: any) => {
        setFieldValue("csv_file", e.currentTarget.files[0]);
    }

    const startMappingHandler = async () => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }

            // mappingCsvColumn

            
            if (mappingRegistryColumnIndex) {
                let selectedRegistryColumns: any[] = [];
                mappingCsvColumn.map((el: any, i: number) => {
                    console.log(mappingRegistryColumnIndex[i]);
                    if(el){
                        selectedRegistryColumns.push(mappingRegistryColumnIndex[i]);
                    }
                })
                
                const { data } = await service({
                    url: `https://octoplusapi.herokuapp.com/columnmapPOST`,
                    method: 'POST',
                    data: { "csv_id": csvId, "columns": selectedRegistryColumns, "dtypes": mappingRegistryColumn, "is_active":"Y"},
                    headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
                });

                await fetchAllCompareRecord(currentPage, perPage);
                setColumnMappingModal(false)
            }

        } catch (err) {
            console.log(err);
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
                        <p>Tools / <span>CSV Compare</span></p>
                        <h5>CSV Compare</h5>
                    </div>
                    <button className={layoutStyles.customBlueBgbtn} onClick={() => setNewCompareModal(true)}>Start New Comparison</button>
                </div>
            </div>
            <div className={layoutStyles.box}>
                <div className={layoutStyles.headContentBox + " p-mb-5"}>
                    <div className={layoutStyles.head}>
                        <h4>Comparison Table</h4>
                    </div>
                    <div className={styles.comparisonTableBox}>
                        <div className={styles.comparisonTableOverflow}>
                            {
                                compareCsvTableSpinner ? <div className={styles.formSpinner}>
                                    <div className={styles.loading}></div>
                                </div> : null
                            }
                            {
                                // contacts.length ?
                                <table className={styles.comparisonTable}>
                                    <thead>
                                        <tr>
                                            <th>Compare Name</th>
                                            <th>CSV File</th>
                                            <th>Work Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            compareData && compareData.length ?
                                                compareData.map((el, i) => {
                                                    return <tr key={"compareTable" + i}>
                                                        <td>{el.compare_name}</td>
                                                        <td>{el.csv_name}</td>
                                                        <td><MultiProgressBar complete={el.work_progress.complate} progress={el.work_progress.progress} ignored={el.work_progress.ignored} /></td>
                                                        <td>
                                                            <div className='p-d-flex'>
                                                                {
                                                                    el.is_active == "Y" ?
                                                                        <button className={layoutStyles.blueTextBtn + " p-d-flex p-ai-center"} onClick={() => router.push(`/report?id=${el._id}`)}><FaRegEye className='p-mr-1' /> <span>Reports</span></button>
                                                                        :
                                                                        null
                                                                }
                                                                <button className={layoutStyles.blueTextBtn + " p-d-flex p-ai-center"} onClick={() => compareCsvDialogHandler(el._id, el.is_active)}><MdCompare className='p-mr-1' /> <span>Continue comparing</span></button>
                                                                <button className={layoutStyles.customRedFontbtn + " p-d-flex p-ai-center"} onClick={() => deleteCsvDialogHandler(el._id)}><FaRegTrashAlt className='p-mr-1' /> <span>Delete</span></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                })
                                                :
                                                <tr>
                                                    <td align='center' colSpan={4}>No record found</td>
                                                </tr>
                                        }
                                    </tbody>
                                </table>
                            }
                        </div>

                        {
                            Math.ceil(totalRecords / perPage) >= 1 && compareData.length ?
                                <CustomPagination totalRecords={totalRecords} currentPage={currentPage} perPage={perPage} currentPageHandler={currentPageHandler} perPageHandler={perPageHandler} />
                                : ''
                        }
                    </div>
                </div>
            </div>

            {/* New Compare Modal */}
            <Dialog showHeader={false} contentClassName={styles.modelsCustomStyles} maskClassName={styles.dialogMask} visible={newCompareModal} style={{ width: '500px', }} onHide={() => ''}>
                <Formik
                    enableReinitialize
                    initialValues={{
                        compare_name: '',
                        registry: 'My Registry',
                        csv_file: '',
                        csv_name: ''
                    }}
                    validationSchema={newCompareSchema}
                    onSubmit={(
                        values: NewCompareFields,
                        { setSubmitting }: FormikHelpers<NewCompareFields>
                    ) => {
                        newCompareSaveHandler(values);
                        setSubmitting(false);
                    }}
                >
                    {props => (
                        <form onSubmit={props.handleSubmit}>
                            {
                                newCompareDataSpinner ? <div className={styles.formSpinner}>
                                    <div className={styles.loading}></div>
                                </div> : null
                            }
                            <div className={styles.replaceDataModal}>
                                <h5>New Compare</h5>
                                <div className={styles.inputFields}>
                                    <div className={styles.replaceFields}>
                                        <div className={styles.inputBox}>
                                            <label>Compare name</label>
                                            <Field type="text" name="compare_name" />
                                            <ErrorMessage name="compare_name">
                                                {(msg) => <p className={styles.error}>{msg}</p>}
                                            </ErrorMessage>
                                        </div>
                                    </div>
                                    <div className={styles.replaceFields}>
                                        <div className={styles.inputBox}>
                                            <Field type="text" name="registry" placeholder="My Registry" readOnly />
                                            <ErrorMessage name="registry">
                                                {(msg) => <p className={styles.error}>{msg}</p>}
                                            </ErrorMessage>
                                        </div>
                                        <AiOutlineSwap className={styles.swapIcon} />
                                        <div className={styles.CSVUpload}>
                                            <div className={styles.inputBox + " p-mb-3"}>
                                                <label
                                                    htmlFor="compareCSVFileUpload"
                                                    className="button">
                                                    Upload CSV
                                                    <FiUpload className='p-ml-auto' />
                                                </label>
                                                <p className={styles.fileName}>{csvFileName(props.values.csv_file)}</p>
                                                <input id="compareCSVFileUpload" name="csv_file" type="file" accept=".csv" onChange={(e) => csvFileUploadHandler(e, props.setFieldValue)} className={styles.CSVFileUpload} />

                                                <ErrorMessage name="csv_file">
                                                    {(msg) => <p className={styles.error}>{msg}</p>}
                                                </ErrorMessage>
                                            </div>
                                            <div className={styles.inputBox}>
                                                <Field type="text" name="csv_name" placeholder="CSV Name" />
                                                <ErrorMessage name="csv_name">
                                                    {(msg) => <p className={styles.error}>{msg}</p>}
                                                </ErrorMessage>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-d-flex p-ai-center p-mt-4">
                                        <div className="p-m-auto">
                                            <button type='button' onClick={() => setNewCompareModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                                            <button type='submit' className={layoutStyles.customBlueBgbtn}>Column mapping</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </Formik>
            </Dialog>

            {/* Column Mapping Modal */}
            <Dialog showHeader={false} contentClassName={styles.modelsCustomStyles} maskClassName={styles.dialogMask} visible={columnMappingModal} style={{ width: '500px', }} onHide={() => ''}>
                <div className={styles.replaceDataModal}>
                    <h5>Column Mapping (Match the Registry columns with CSV)</h5>
                    <div className={styles.inputFields}>

                        <div className={styles.columnMappingBox}>
                            {/* 
                                <div className={styles.columnsData}>
                                    <span className={styles.columnItem}>Registry Column</span>
                                    {
                                        mappingRegistryColumn ?
                                            Object.keys(mappingRegistryColumn).map((el, i) => {
                                                return <span key={"registryColumn" + i} className={styles.columnItem}>{el}</span>
                                            })
                                            : ''
                                    }
                                </div>
                            */}
                            <div className={styles.columnsData}>
                                <span className={styles.columnItem}>CSV Column</span>
                                {
                                    mappingCsvColumn ?
                                        mappingCsvColumn.map((el: any, i: number) => {
                                            return <span key={"registryColumn" + i} className={styles.columnItem}>{el}</span>
                                        })
                                        : ''
                                }
                            </div>
                            <div className={styles.columnsData}>
                                <span className={styles.columnItem}>CSV Column</span>

                                {
                                    mappingRegistryColumnIndex ?
                                        <DragSwap mappingRegistryColumn={mappingRegistryColumnIndex} setMapppingTabledata={setMappingRegistryColumnIndex} className={styles.columnItem} classNameIgnore={styles.columnItem + " " + styles.columnItemIgnore} />
                                        : ''
                                }
                            </div>
                            {/* <div className={styles.columnsData}>
                                <span className={styles.columnItem}>Data Type</span>
                                {
                                    mappingRegistryColumn ?
                                        Object.keys(mappingRegistryColumn).map((el, i) => {
                                            return <span key={"TypesOfColumn" + i} className={styles.columnItem}>
                                                <Dropdown id="inviteRole" className={styles.selectBox} name="dtype" value={mappingRegistryColumn[el]} options={dataType} onChange={(e) => setRegistryColumnTypeHandler(e, i)} />
                                            </span>
                                        })
                                        : ''
                                }
                            </div> */}
                        </div>
                        <div className='p-mt-3'>
                            <button type='button' onClick={() => setAddNewFieldModal(true)} className={layoutStyles.customBluebtn + " p-d-flex p-ai-center"}><FiPlus /> Add Field</button>
                        </div>

                        <div className="p-d-flex p-ai-center p-mt-4">
                            <div className="p-m-auto">
                                <button type='button' onClick={() => setColumnMappingModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                                <button type='button' onClick={() => startMappingHandler()} className={layoutStyles.customBlueBgbtn}>Start Comparing</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Add New Field-Modal */}
            <Dialog showHeader={false} contentClassName={styles.addNewFieldModalCustomStyles} maskClassName={styles.dialogMask} visible={addNewFieldModal} style={{ width: '500px', }} onHide={() => ''}>
                <div className={styles.addNewFieldModal}>
                    <h5>Add new field</h5>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            column: '',
                            dtype: 'text'
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(
                            values: AddNewFiled,
                            { setSubmitting }: FormikHelpers<AddNewFiled>
                        ) => {
                            addNewFiledHandler(JSON.stringify(values, null, 2));
                            setSubmitting(false);
                        }}
                    >
                        {props => (
                            <form onSubmit={props.handleSubmit}>
                                {
                                    addFiledSpinner ? <div className={styles.formSpinner}>
                                        <div className={styles.loading}></div>
                                    </div> : null
                                }
                                <div className={styles.inputFields}>
                                    <div className={styles.inputBox}>
                                        <label htmlFor="column">Enter field name for new column</label>
                                        <Field type="text" name="column" />
                                        <ErrorMessage name="column">
                                            {(msg) => <p className={styles.error}>{msg}</p>}
                                        </ErrorMessage>
                                    </div>

                                    <div className={styles.inputBox}>
                                        <label htmlFor="dataType">Select the data type</label>
                                        <Dropdown id="inviteRole" className={styles.selectBox} name="dtype" value={props.values.dtype} options={dataType} onChange={(e: any) => props.setFieldValue('dtype', e.target.value)} />
                                    </div>
                                    <div className="p-d-flex p-ai-center p-mt-4">
                                        <div className="p-m-auto">
                                            <button type='submit' className={layoutStyles.customBlueBgbtn}>Save</button>
                                            <button type='button' onClick={() => setAddNewFieldModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Dialog>

        </DashboardLayout>
    )
}

export default withProtectSync(CsvCompare)

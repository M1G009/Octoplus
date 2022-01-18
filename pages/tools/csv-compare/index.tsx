// React Module Imports
import React, { useState } from 'react'
// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

// Prime React Imports
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';

// 3rd Party Imports
import * as yup from 'yup';
import { AiOutlineSwap } from "react-icons/ai";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { ErrorMessage, Formik, FieldArray, Field, FormikHelpers } from 'formik';
import { ToastContainer } from "react-toastify";
import { FiUpload, FiPlus } from 'react-icons/fi';

// Style and Component Imports
import CustomPagination from '../../../components/CustomPagination'
import layoutStyles from '../../../styles/Home.module.scss';
import styles from '../../../styles/product.module.scss';
import { withProtectSync } from "../../../utils/protect"
import DashboardLayout from '../../../components/DashboardLayout';
import MultiProgressBar from '../../../components/MultiProgressBar';

// Interface/Helper Imports

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

{/* add field button */ }
const CsvCompare: NextPage = (props: any) => {
    const router = useRouter();
    const [newCompareModal, setNewCompareModal] = useState(false);
    const [newCompareDataSpinner, setNewCompareDataSpinner] = useState(false)
    const [dataType, setDataType] = useState(["text", "email", "date", "number", "textarea", "checkbox"])
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
            csv: "LinkedIn",
            type: "text",
        }
    ])
    // Pagination States
    const [totalRecords, setTotalRecords] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [contacts, setContacts] = useState<any[]>([]);
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

    const currentPageHandler = (num: number) => {
        setCurrentPage(num);
    }

    const perPageHandler = (num: number) => {
        setCurrentPage(1);
        setPerPage(num);
    }

    const csvFileUploadHandler = (e: any, setFieldValue: any) => {
        setFieldValue("csv_file", e.currentTarget.files[0]);
    }

    const newCompareSaveHandler = (getData: any) => {
        setColumnMappingModal(true);
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
            //   return "File Name:- New Contacts.CSV"
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
          console.log(getData);
          
        } catch (err) {
          
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
                            {/* {
                                createContactTableSpinner ? <div className={styles.formSpinner}>
                                    <div className={styles.loading}></div>
                                </div> : null
                            } */}
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
                                        <tr>
                                            <td>Test 1 Compare</td>
                                            <td>xyz1.csv</td>
                                            <td><MultiProgressBar complete={1500} progress={500} ignored={20} /></td>
                                            <td>
                                                <div className='p-d-flex'>
                                                    <button className={layoutStyles.blueTextBtn + " p-d-flex p-ai-center"}><FaRegEye className='p-mr-1' /> <span>See Details</span></button>
                                                    <button className={layoutStyles.blueTextBtn + " p-d-flex p-ai-center"}><FaRegTrashAlt className='p-mr-1' /> <span>Delete</span></button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Test 1 Compare</td>
                                            <td>xyz1.csv</td>
                                            <td><MultiProgressBar complete={1200} progress={400} ignored={50} /></td>
                                            <td>
                                                <div className='p-d-flex'>
                                                    <button className={layoutStyles.blueTextBtn + " p-d-flex p-ai-center"}><FaRegEye className='p-mr-1' /> <span>See Details</span></button>
                                                    <button className={layoutStyles.blueTextBtn + " p-d-flex p-ai-center"}><FaRegTrashAlt className='p-mr-1' /> <span>Delete</span></button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Test 1 Compare</td>
                                            <td>xyz1.csv</td>
                                            <td><MultiProgressBar complete={1200} progress={700} ignored={100} /></td>
                                            <td>
                                                <div className='p-d-flex'>
                                                    <button className={layoutStyles.blueTextBtn + " p-d-flex p-ai-center"}><FaRegEye className='p-mr-1' /> <span>See Details</span></button>
                                                    <button className={layoutStyles.blueTextBtn + " p-d-flex p-ai-center"}><FaRegTrashAlt className='p-mr-1' /> <span>Delete</span></button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Test 1 Compare</td>
                                            <td>xyz1.csv</td>
                                            <td><MultiProgressBar complete={1600} progress={400} ignored={800} /></td>
                                            <td>
                                                <div className='p-d-flex'>
                                                    <button className={layoutStyles.blueTextBtn + " p-d-flex p-ai-center"}><FaRegEye className='p-mr-1' /> <span>See Details</span></button>
                                                    <button className={layoutStyles.blueTextBtn + " p-d-flex p-ai-center"}><FaRegTrashAlt className='p-mr-1' /> <span>Delete</span></button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                // : <p className='p-text-center'>No data found</p>
                            }
                        </div>

                        {
                            Math.ceil(totalRecords / perPage) >= 1 && contacts.length ?
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
                                            {/* <div className={styles.inputBox + " p-mb-3"}>
                                                <input id="file" name="csv_file" type="file" onChange={(e) => csvFileUploadHandler(e, props.setFieldValue)} />
                                                <ErrorMessage name="csv_file">
                                                    {(msg) => <p className={styles.error}>{msg}</p>}
                                                </ErrorMessage>
                                            </div> */}
                                            <div className={styles.inputBox + " p-mb-3"}>
                                                <label
                                                    htmlFor="compareCSVFileUpload"
                                                    className="button">
                                                    Upload CSV
                                                    <FiUpload className='p-ml-auto' />
                                                </label>
                                                <p className={styles.fileName}>{csvFileName(props.values.csv_file)}</p>
                                                <input id="compareCSVFileUpload" name="csv_file" type="file" accept=".csv" onChange={(e) => csvFileUploadHandler(e, props.setFieldValue)} className={styles.CSVFileUpload} />

                                                <ErrorMessage name="file">
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

                        <table className={styles.columnMappingTable}>
                            <thead>
                                <tr>
                                    <th>Registry Column</th>
                                    <th>CSV Column</th>
                                    <th>Data Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    mappingTableData.length ?
                                        mappingTableData.map((el, i) => {
                                            return <tr key={"mappingColumn" + i}>
                                                <td>{el.registry}</td>
                                                <td>{el.csv}</td>
                                                <td>
                                                    <Dropdown id="inviteRole" className={styles.selectBox} name="dtype" value={el.type} options={dataType} onChange={(e) => setRegistryColumnTypeHandler(e, i)} />
                                                </td>
                                            </tr>
                                        })
                                        :
                                        ''
                                }
                                <tr>
                                    <td colSpan={4}>
                                        <button type='button' onClick={() => setAddNewFieldModal(true)} className={layoutStyles.customBluebtn + " p-d-flex p-ai-center"}><FiPlus /> Add Field</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>


                        <div className="p-d-flex p-ai-center p-mt-4">
                            <div className="p-m-auto">
                                <button type='button' onClick={() => setColumnMappingModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                                <button type='button' onClick={() => router.push('/tools/csv-compare/dashboard')} className={layoutStyles.customBlueBgbtn}>Start Comparing</button>
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

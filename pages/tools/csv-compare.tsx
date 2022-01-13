// React Module Imports
import React, { useState } from 'react'
// Next Module Imports
import type { NextPage } from 'next'

// Prime React Imports
import { Dialog } from 'primereact/dialog';

// 3rd Party Imports
import * as yup from 'yup';
import { AiOutlineSwap } from "react-icons/ai";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { ErrorMessage, Formik, FieldArray, Field, FormikHelpers } from 'formik';
import { ToastContainer } from "react-toastify";
import toast from "../../components/Toast";

// Style and Component Imports
import CustomPagination from '../../components/CustomPagination'
import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/product.module.scss';
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';
import MultiProgressBar from '../../components/MultiProgressBar'

// Interface/Helper Imports

export interface NewCompareFields {
    compare_name: string,
    registry: string,
    csv_file: any,
    csv_name: string
}


const CsvCompare: NextPage = (props: any) => {
    const [newCompareModal, setNewCompareModal] = useState(false);
    const [newCompareDataSpinner, setNewCompareDataSpinner] = useState(false)

    // Pagination States
    const [totalRecords, setTotalRecords] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [contacts, setContacts] = useState<any[]>([]);
    const [columnMappingModal, setColumnMappingModal] = useState(false)

    const newCompareSchema = yup.object().shape({
        compare_name: yup.string().required('Please enter Select data'),
        registry: yup.string().required('Please enter Change to'),
        csv_file: yup.string().required('Please upload CSV file'),
        csv_name: yup.string().required('Please enter csv name')
    });

    const currentPageHandler = (num: number) => {
        setCurrentPage(num);
    }

    const perPageHandler = (num: number) => {
        setCurrentPage(1);
        setPerPage(num);
    }

    const replaceDataDialogCloseHandler = (e: any) => {
        if (e.target.classList.contains("p-dialog-mask")) {
            setNewCompareModal(false);
        }
    }

    const csvFileUploadHandler = (e: any, setFieldValue: any) => {
        setFieldValue("csv_file", e.currentTarget.files[0]);
    }

    const newCompareSaveHandler = (getData: any) => {
        console.log(getData);
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
                                            <td><MultiProgressBar /></td>
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

            {/* New Compare data-Modal */}
            <Dialog showHeader={false} onMaskClick={replaceDataDialogCloseHandler} contentClassName={styles.modelsCustomStyles} maskClassName={styles.dialogMask} visible={newCompareModal} style={{ width: '500px', }} onHide={() => ''}>
                <Formik
                    enableReinitialize
                    initialValues={{
                        compare_name: '',
                        registry: '',
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
                                            <Field type="text" name="registry" placeholder="My Registry" />
                                            <ErrorMessage name="registry">
                                                {(msg) => <p className={styles.error}>{msg}</p>}
                                            </ErrorMessage>
                                        </div>
                                        <AiOutlineSwap className={styles.swapIcon} />
                                        <div>
                                            <div className={styles.inputBox + " p-mb-3"}>
                                                <input id="file" name="csv_file" type="file" onChange={(e) => csvFileUploadHandler(e, props.setFieldValue)} />
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
                                            <button type='submit' className={layoutStyles.customBlueBgbtn}>Save</button>
                                            <button type='button' onClick={() => setNewCompareModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </Formik>
            </Dialog>

            {/* Column Mapping data-Modal */}
            <Dialog showHeader={false} onMaskClick={replaceDataDialogCloseHandler} contentClassName={styles.modelsCustomStyles} maskClassName={styles.dialogMask} visible={columnMappingModal} style={{ width: '500px', }} onHide={() => ''}>
                <Formik
                    enableReinitialize
                    initialValues={{
                        compare_name: '',
                        registry: '',
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
                                <h5>Column Mapping (Match the Registry columns with CSV)</h5>
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
                                            <Field type="text" name="registry" placeholder="My Registry" />
                                            <ErrorMessage name="registry">
                                                {(msg) => <p className={styles.error}>{msg}</p>}
                                            </ErrorMessage>
                                        </div>
                                        <AiOutlineSwap className={styles.swapIcon} />
                                        <div>
                                            <div className={styles.inputBox + " p-mb-3"}>
                                                <input id="file" name="csv_file" type="file" onChange={(e) => csvFileUploadHandler(e, props.setFieldValue)} />
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
                                            <button type='submit' className={layoutStyles.customBlueBgbtn}>Save</button>
                                            <button type='button' onClick={() => setNewCompareModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </Formik>
            </Dialog>
        </DashboardLayout>
    )
}

export default withProtectSync(CsvCompare)

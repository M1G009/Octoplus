// React Module Imports
import React, { useState } from 'react'
// Next Module Imports
import type { NextPage } from 'next'

// Prime React Imports
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';

// 3rd Party Imports
import * as yup from 'yup';
import { FaRegEdit } from "react-icons/fa";
import { ErrorMessage, Formik, FieldArray, Field, FormikHelpers } from 'formik';
import { BsExclamationCircleFill } from "react-icons/bs";

// Style and Component Imports
import layoutStyles from '../../../styles/Home.module.scss';
import styles from '../../../styles/product.module.scss';
import { withProtectSync } from "../../../utils/protect"
import DashboardLayout from '../../../components/DashboardLayout';

// Interface/Helper Imports

export interface contactFixingFields {
    country: string,
    city: string,
    postal: string,
    fixing: string
}

const CsvCompare: NextPage = (props: any) => {
    const [assignContactFixingModal, setAssignContactFixingModal] = useState(false)
    const [contactFixingSpinner, setContactFixingSpinner] = useState(false)
    const [dataType, setDataType] = useState(["text", "email", "date", "number", "textarea", "checkbox"]);
    const [saveContactModal, setSaveContactModal] = useState(false);

    const contactFixingSchema = yup.object().shape({
        compare_name: yup.string().required('Please enter Select data'),
        registry: yup.string().required('Please enter Change to'),
        csv_file: yup.string().required('Please upload CSV file'),
        csv_name: yup.string().required('Please enter csv name')
    });

    const contactFixingHandler = (getdata: any) => {

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
                            <div className={styles.columnsBox}>
                                <div className={styles.columnText + " " + styles.active}>
                                    <h6>Phone number </h6>
                                    <p><span className={styles.deblicateData}>(25 duplicates)</span><span>•</span><span className={styles.unique}>(100 are unique)</span></p>
                                </div>
                                <div className={styles.columnText}>
                                    <h6>Phone number </h6>
                                    <p><span className={styles.deblicateData}>(25 duplicates)</span><span>•</span><span className={styles.unique}>(100 are unique)</span></p>
                                </div>
                                <div className={styles.columnText}>
                                    <h6>Phone number </h6>
                                    <p><span className={styles.deblicateData}>(25 duplicates)</span><span>•</span><span className={styles.unique}>(100 are unique)</span></p>
                                </div>
                            </div>
                            <div className={styles.singleColumnBox}>
                                <div className={"p-inputgroup " + styles.searchInput}>
                                    <InputText placeholder="Search phone number...." />
                                    <Button icon="pi pi-search" />
                                </div>
                                <div className={styles.searchContentBox}>
                                    <div className={styles.columnText}>
                                        <h6>+44-7991234693</h6>
                                        <p>1 in Registry, 2 in CSV</p>
                                    </div>
                                    <div className={styles.columnText + " " + styles.active}>
                                        <h6>+44-7991234693</h6>
                                        <p>1 in Registry, 2 in CSV</p>
                                    </div>
                                    <div className={styles.columnText}>
                                        <h6>+44-7991234693</h6>
                                        <p>1 in Registry, 2 in CSV</p>
                                    </div>
                                    <div className={styles.columnText}>
                                        <h6>+44-7991234693</h6>
                                        <p>1 in Registry, 2 in CSV</p>
                                    </div>
                                    <div className={styles.columnText}>
                                        <h6>+44-7991234693</h6>
                                        <p>1 in Registry, 2 in CSV</p>
                                    </div>
                                    <div className={styles.columnText}>
                                        <h6>+44-7991234693</h6>
                                        <p>1 in Registry, 2 in CSV</p>
                                    </div>
                                    <div className={styles.columnText}>
                                        <h6>+44-7991234693</h6>
                                        <p>1 in Registry, 2 in CSV</p>
                                    </div>
                                    <div className={styles.columnText}>
                                        <h6>+44-7991234693</h6>
                                        <p>1 in Registry, 2 in CSV</p>
                                    </div>
                                    <div className={styles.columnText}>
                                        <h6>+44-7991234693</h6>
                                        <p>1 in Registry, 2 in CSV</p>
                                    </div>
                                    <div className={styles.columnText}>
                                        <h6>+44-7991234693</h6>
                                        <p>1 in Registry, 2 in CSV</p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.detailsBox + " customCheckBox"}>
                                <div className={styles.textBox}>
                                    <div className={styles.headBox + " p-d-flex p-ai-center p-jc-between"}>
                                        <div className={styles.columnHead}>
                                            <div className='p-d-flex p-ai-center p-mb-3'>
                                                <h4>+44-7991234693</h4>
                                                <p className='p-ml-2'>1 Registry, 3 CSV</p>
                                            </div>
                                            <p className={styles.text}>Kindly select below data to perform desire action</p>
                                        </div>
                                        <button className={layoutStyles.customBluebtn} onClick={() => setAssignContactFixingModal(true)} >Assign Contact Fixing</button>
                                    </div>
                                    <div className={styles.bottomBox}>
                                        <div className={styles.titleText}>
                                            <h6>
                                                Registry Database
                                            </h6>
                                        </div>
                                        <div className={styles.dataBox + " " + styles.registryDataBox}>
                                            <Checkbox inputId="cb3" value="Los Angeles" checked={true}></Checkbox>
                                            <div className='p-mx-3'>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Name</label>
                                                    <p>Suryansh Srivastava</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Address</label>
                                                    <p>UP, India 221007</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Phone Number</label>
                                                    <p className={styles.numberText}>+91 8791234693</p>
                                                </div>
                                            </div>
                                            <button className={layoutStyles.blueTextBtn + " p-ml-auto p-as-start p-d-flex"}><FaRegEdit className='p-mr-1' />Edit</button>
                                        </div>
                                        <div className={styles.titleText}>
                                            <h6>
                                                CSV File Data
                                            </h6>
                                        </div>
                                        <div className={styles.dataBox + " " + styles.csvDataBox}>
                                            <Checkbox inputId="cb3" value="Los Angeles" checked={true}></Checkbox>
                                            <div className='p-mx-3'>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Name</label>
                                                    <p>Suryansh Srivastava</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Address</label>
                                                    <p>UP, India 221007</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Phone Number</label>
                                                    <p className={styles.numberText}>+91 8791234693</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.dataBox + " " + styles.csvDataBox}>
                                            <Checkbox inputId="cb3" value="Los Angeles" checked={true}></Checkbox>
                                            <div className='p-mx-3'>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Name</label>
                                                    <p>Suryansh Srivastava</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Address</label>
                                                    <p>UP, India 221007</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Phone Number</label>
                                                    <p className={styles.numberText}>+91 8791234693</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.dataBox + " " + styles.csvDataBox}>
                                            <Checkbox inputId="cb3" value="Los Angeles" checked={true}></Checkbox>
                                            <div className='p-mx-3'>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Name</label>
                                                    <p>Suryansh Srivastava</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Address</label>
                                                    <p>UP, India 221007</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Phone Number</label>
                                                    <p className={styles.numberText}>+91 8791234693</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.dataBox + " " + styles.csvDataBox}>
                                            <Checkbox inputId="cb3" value="Los Angeles" checked={true}></Checkbox>
                                            <div className='p-mx-3'>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Name</label>
                                                    <p>Suryansh Srivastava</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Address</label>
                                                    <p>UP, India 221007</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Phone Number</label>
                                                    <p className={styles.numberText}>+91 8791234693</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.dataBox + " " + styles.csvDataBox}>
                                            <Checkbox inputId="cb3" value="Los Angeles" checked={true}></Checkbox>
                                            <div className='p-mx-3'>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Name</label>
                                                    <p>Suryansh Srivastava</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Address</label>
                                                    <p>UP, India 221007</p>
                                                </div>
                                                <div className='p-d-flex p-ai-center p-mb-2'>
                                                    <label htmlFor="">Phone Number</label>
                                                    <p className={styles.numberText}>+91 8791234693</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                        enableReinitialize
                        initialValues={{
                            country: 'text',
                            city: 'text',
                            postal: 'text',
                            fixing: 'text'
                        }}
                        validationSchema={contactFixingSchema}
                        onSubmit={(
                            values: contactFixingFields,
                            { setSubmitting }: FormikHelpers<contactFixingFields>
                        ) => {
                            contactFixingHandler(JSON.stringify(values, null, 2));
                            setSubmitting(false);
                        }}
                    >
                        {props => (
                            <form onSubmit={props.handleSubmit}>
                                {
                                    contactFixingSpinner ? <div className={styles.formSpinner}>
                                        <div className={styles.loading}></div>
                                    </div> : null
                                }
                                <div className={styles.inputFields + " " + styles.contactFixingModal}>
                                    <p className='p-mt-0'>Filter and define the contacts you need to assign to a member for fixing</p>
                                    <div className={styles.inputBox}>
                                        <label htmlFor="dataType">Select Country</label>
                                        <Dropdown id="inviteRole" className={styles.selectBox} name="country" value={props.values.country} options={dataType} onChange={(e: any) => props.setFieldValue('country', e.target.value)} />
                                    </div>
                                    <div className={styles.inputBox}>
                                        <label htmlFor="dataType">Select City</label>
                                        <Dropdown id="inviteRole" className={styles.selectBox} name="city" value={props.values.city} options={dataType} onChange={(e: any) => props.setFieldValue('city', e.target.value)} />
                                    </div>
                                    <div className={styles.inputBox}>
                                        <label htmlFor="dataType">Select Postal Code</label>
                                        <Dropdown id="inviteRole" className={styles.selectBox} name="postal" value={props.values.postal} options={dataType} onChange={(e: any) => props.setFieldValue('postal', e.target.value)} />
                                    </div>
                                    <div className={styles.inputBox}>
                                        <label htmlFor="dataType">Assign contact fixing to</label>
                                        <Dropdown id="inviteRole" className={styles.selectBox} name="fixing" value={props.values.fixing} options={dataType} onChange={(e: any) => props.setFieldValue('fixing', e.target.value)} />
                                    </div>
                                    <div className="p-d-flex p-ai-center p-mt-4">
                                        <div className="p-m-auto">
                                            <button type='submit' className={layoutStyles.customBlueBgbtn}>Assign</button>
                                            <button type='button' onClick={() => setAssignContactFixingModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                                        </div>
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
                            <button className={layoutStyles.customBluebtn} onClick={() => setSaveContactModal(false)}>Yes, save a copy</button>
                            <button className={layoutStyles.customBlueBgbtn} onClick={() => setSaveContactModal(false)}>Replace current data</button>
                        </div>
                    </div>
                </div>
            </Dialog>

        </DashboardLayout>
    )
}

export default withProtectSync(CsvCompare)

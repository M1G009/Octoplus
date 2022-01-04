// React Module Imports
import React, { useState, useEffect } from 'react';

// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

// Prime React Imports
import { Dropdown } from 'primereact/dropdown';
import { Menubar } from 'primereact/menubar';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { FiUpload } from 'react-icons/fi';

// 3rd Party Imports
import * as yup from 'yup';
import { AiOutlineSwap } from "react-icons/ai";
import { ErrorMessage, Formik, FieldArray, Field, FormikHelpers } from 'formik';
import toast from "../components/Toast";
import DragDrop from '../components/DragDrop'

// Style and Component Imports
import CustomPagination from '../components/CustomPagination'
import { withProtectSync } from "../utils/protect"
import DashboardLayout from '../components/DashboardLayout';
import layoutStyles from '../styles/Home.module.scss';
import styles from '../styles/registry.module.scss'

// Interface/Helper Imports
import service from '../helper/api/api';


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
  [key: string]: string
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

const Dashboard: NextPage = () => {
  const router = useRouter();
  const [noDataModal, setNoDataModal] = useState(false);
  const [noDataModalSpinner, setNoDataModalSpinner] = useState(false);
  const [addFiledSpinner, setAddFiledSpinner] = useState(false);
  const [replaceDataSpinner, setReplaceDataSpinner] = useState(false);
  const [settingDataModal, setSettingDataModal] = useState(false);
  const [contactDataUpdated, setContactDataUpdated] = useState(false);
  const [createContactSpinner, setCreateContactSpinner] = useState(false);
  const [createNewContactModal, setCreateNewContactModal] = useState(false);
  const [deleteColumnModal, setDeleteColumnModal] = useState(false);
  const [deleteColumnName, setDeleteColumnName] = useState(null)
  const [deleteFromDatabase, setDeleteFromDatabase] = useState(false);
  const [deleteColumnModalSpinner, setDeleteColumnModalSpinner] = useState(false);
  const [editContactRowId, setEditContactRowId] = useState(null)
  const [editColumnModalSpinner, setEditColumnModalSpinner] = useState(false);
  const [createContactTableSpinner, setCreateContactTableSpinner] = useState(false);
  const [addNewFieldModal, setAddNewFieldModal] = useState(false);
  const [replaceDataModal, setReplaceDataModal] = useState(false);
  const [initialValues, setInitialValues] = useState<DynamicFields>()
  const [types, setTypes] = useState<DynamicFields>()
  const [columns, setColumns] = useState<TableColumns[]>([])

  // Pagination States
  const [totalRecords, setTotalRecords] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [dataType, setDataType] = useState(["text", "email", "date", "number", "textarea", "checkbox"])
  const [contacts, setContacts] = useState<any[]>([]);
  const [replaceColumn, setReplaceColumn] = useState(true)

  const fetchAllContact = async (page: number, limit: number) => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }
      setCreateContactTableSpinner(true)
      const { data } = await service({
        url: `https://octoplusapi.herokuapp.com/getregistry?page=${page}&limit=${limit}`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });
      if (data) {      
        if (!data.data.length && !data.data.registry) {
          setNoDataModal(true)
        }
        // setColumns
        let withVal = { ...data.data.dtypes };
        Object.keys(withVal).forEach(function (key) { withVal[key] = "" });
        delete withVal.id
        setInitialValues(withVal);

        let columnArray: TableColumns[] = [];

        let showFields = data.data.show;
        Object.keys(showFields).map((el: any, index: number) => {
          let columnObj = { id: index, name: "", editedName: "", hide: true, readonly: true }
          columnObj['name'] = el;
          columnObj['editedName'] = el;
          columnObj['hide'] = !Boolean(showFields[el]);
          columnObj['readonly'] = true;
          columnArray.push(columnObj)
        })

        let hideFields = data.data.hide;
        Object.keys(hideFields).map((el: any, index: number) => {
          let columnObj = { id: Object.keys(showFields).length + index, name: "", editedName: "", hide: true, readonly: true }
          columnObj['name'] = el;
          columnObj['editedName'] = el;
          columnObj['hide'] = !Boolean(hideFields[el]);
          columnObj['readonly'] = true;
          columnArray.push(columnObj)
        })

        setColumns(columnArray);
        setTypes(data.data.dtypes);
        setContacts(data.data.registry);
        setTotalRecords(data.data.total_rows)
      }
      setCreateContactTableSpinner(false)
    } catch (err) {
      setCreateContactTableSpinner(false)
      return await toast({ type: "error", message: err });
    }
  }

  useEffect(() => {
    fetchAllContact(currentPage, perPage);
  }, [currentPage, perPage])

  const validationSchema = yup.object().shape({
    column: yup.string().required('Please field name')
  });

  const replaceValueSchema = yup.object().shape({
    replace_from: yup.string().required('Please enter Select data'),
    replace_to: yup.string().required('Please enter Change to'),
    column: yup.string()
  });

  const currentPageHandler = (num: number) => {
    setCurrentPage(num);
  }

  const perPageHandler = (num: number) => {
    setCurrentPage(1);
    setPerPage(num);
  }

  const items = [
    {
      label: 'Replace Data',
      className: styles.menuItem,
      command: () => { setReplaceDataModal(true) }
    },
    {
      label: 'Export in CSV',
      className: `${styles.menuItem} ${styles.dropMenu}`,
      items: [
        {
          label: 'Export in CSV',
          command: () => { exportCsvGenerator() }
        }
      ]
    },
    {
      label: 'Create New Contact',
      className: `${styles.createNewBtn}`,
      command: () => { setCreateNewContactModal(true) }
    }
  ];

  const exportCsvGenerator = async () => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      let data = await service({
        url: `https://octoplusapi.herokuapp.com/export`,
        method: 'POST',
        data: { "format": "csv" },
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });
      let csvContent = "data:text/csv;charset=utf-8," + data.data;
      var encodedUri = encodeURI(csvContent);
      window.open(encodedUri);

    } catch (err) {
      return await toast({ type: "error", message: err });
    }
  }

  const contactFieldsTypeHandler = (key: string) => {
    if (types) {

      if (types[key].toLowerCase() == "textarea") {
        return <div>
          <Field name={key}>
            {({ field }: any) => (
              <textarea {...field} />
            )}
          </Field>
          <ErrorMessage name={key}>
            {(msg) => <p className={styles.error}>{msg}</p>}
          </ErrorMessage>
        </div>
      } else if (types[key].toLowerCase() == "checkbox") {
        return <div>
          <Field name={key}>
            {({ field }: any) => (
              <Checkbox {...field} checked={field.value}></Checkbox>
            )}
          </Field>
          <ErrorMessage name={key}>
            {(msg) => <p className={styles.error}>{msg}</p>}
          </ErrorMessage>
        </div>
      }
      return <div>
        <Field type={types[key].toLowerCase()} name={key} />
        <ErrorMessage name={key}>
          {(msg) => <p className={styles.error}>{msg}</p>}
        </ErrorMessage>
      </div>
    }
  }

  const emptyContactFiledHandler = () => {
    let values = { ...initialValues };
    Object.keys(values).map(key => {
      values[key] = '';
    })
    setEditContactRowId(null);
    setInitialValues(values);
    setCreateNewContactModal(false);

  }

  const createNewContactHanler = async (getData: any) => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      setCreateContactSpinner(true)
      if (editContactRowId) {
        let editObj = Object.assign(JSON.parse(getData), { "row_id": editContactRowId });
        await service({
          url: `https://octoplusapi.herokuapp.com/edit_feild`,
          method: 'POST',
          data: editObj,
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
        });
      } else {
        await service({
          url: `https://octoplusapi.herokuapp.com/insert_registry`,
          method: 'POST',
          data: { insert: [JSON.parse(getData)] },
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
        });
      }

      setCreateContactSpinner(false)
      setCreateNewContactModal(false)
      setEditContactRowId(null);
      return await fetchAllContact(currentPage, perPage);

    } catch (err) {
      setCreateContactSpinner(false)
      setEditContactRowId(null);
      return await toast({ type: "error", message: err });
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
      return await fetchAllContact(currentPage, perPage);
    } catch (err) {
      setAddFiledSpinner(false)
      await toast({ type: "error", message: err });
      return setAddNewFieldModal(false)
    }
  }

  const replacedataSaveBtnHandler = async (getData: any) => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      let replacedata = JSON.parse(getData);

      if (!replacedata.column) {
        delete replacedata.column;
      }
      setReplaceDataSpinner(true)
      await service({
        url: `https://octoplusapi.herokuapp.com/replace_registry`,
        method: 'POST',
        data: replacedata,
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });

      setReplaceDataSpinner(false)
      setReplaceDataModal(false)
      return await fetchAllContact(currentPage, perPage);
    } catch (err) {
      setReplaceDataSpinner(false)
      return await toast({ type: "error", message: err });
    }
  }

  const editContactFiledHandler = async (id: any) => {
    let copyObj = [...contacts].slice().find(el => el.id == id);
    var checkId = Object.assign({}, copyObj);
    setEditContactRowId(id);
    delete checkId.id;
    setInitialValues(checkId);
    setCreateNewContactModal(true);
  }

  const columnEditHandler = (id: any) => {
    let columnData = columns.map((task: any) => {
      if (task.id == id) task.readonly = !task.readonly;
      return task;
    });

    setColumns(columnData);
  }

  const setEditNameHandler = (value: any, id: number) => {
    let newArray: TableColumns[] = [...columns];
    let newObj = newArray.find(el => el.id == id);
    if (newObj) {
      newObj['editedName'] = value;
    }

    newArray.map(obj => obj.id == id ? newObj : obj);
    setColumns(newArray)
  }

  const saveColumnHandler = async (id: number) => {
    try {
      let findObj = columns.find(el => el.id == id);
      if (findObj) {
        let newArray: TableColumns[] = [...columns];
        let newObj = newArray.find(el => el.id == id);
        if (newObj) {
          newObj['readonly'] = true;
        }
        if (findObj.editedName == findObj.name) {
          newArray.map(obj => obj.id == id ? newObj : obj);
          setColumns(newArray)
        } else {
          newArray.map(obj => obj.id == id ? newObj : obj);
          setColumns(newArray)
          // ...... Update Column Name Handler ......
          let authToken = await window.localStorage.getItem('authToken');

          if (!authToken) {
            window.localStorage.removeItem("authToken")
            window.localStorage.removeItem("ValidUser")
            window.localStorage.removeItem('loginUserdata');
            return router.push('/auth');
          }
          setEditColumnModalSpinner(true)
          await service({
            url: `https://octoplusapi.herokuapp.com/rename`,
            method: 'POST',
            data: { "column": findObj.name, "rename": findObj.editedName },
            headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
          });
          setEditColumnModalSpinner(false);
          return await fetchAllContact(currentPage, perPage);
        }
      }
    } catch (err) {
      setEditColumnModalSpinner(false);
      return await toast({ type: "error", message: err });
    }
  }

  const hideShowColumnHandler = async (dataColumn: any) => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }
      setEditColumnModalSpinner(true)

      if (dataColumn) {
        let columnsObj: columnsHideShowFileds = {};
        dataColumn.map((el: any) => {
          columnsObj[`${el.name}`] = !el.hide;
        })
        await service({
          url: `https://octoplusapi.herokuapp.com/getregistry`,
          method: 'POST',
          data: { column: columnsObj },
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
        });

        let columnsOrder: String[] = [];
        dataColumn.map((el: any) => {
          if (!el.hide) {
            columnsOrder.push(el.name)
          }
        })

        await service({
          url: `https://octoplusapi.herokuapp.com/columnorder`,
          method: 'POST',
          data: { columns: columnsOrder },
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
        });
      }

      setEditColumnModalSpinner(false);
      return await fetchAllContact(currentPage, perPage);
    } catch (err) {
      setEditColumnModalSpinner(false)
      return await toast({ type: "error", message: err });
    }
  }

  const deleteColumnHandler = async () => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      setDeleteColumnModalSpinner(true)
      if (types && deleteColumnName) {
        let columnName = { "column": deleteColumnName, "dtype": types[deleteColumnName] }

        await service({
          url: `https://octoplusapi.herokuapp.com/delete_feild`,
          method: 'POST',
          data: columnName,
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
        });
      }

      setDeleteColumnName(null);
      setDeleteColumnModalSpinner(false)
      setDeleteColumnModal(false);
      return await fetchAllContact(currentPage, perPage);
    } catch (err) {
      setDeleteColumnModalSpinner(true);
      setDeleteColumnModal(false);
      return await toast({ type: "error", message: err });
    }
  }

  const createContactDialogCloseHandler = (e: any) => {
    if (e.target.classList.contains("p-dialog-mask")) {
      emptyContactFiledHandler();
    }
  }

  const addNewFieldDialogCloseHandler = (e: any) => {
    if (e.target.classList.contains("p-dialog-mask")) {
      setAddNewFieldModal(false)
    }
  }

  const replaceDataDialogCloseHandler = (e: any) => {
    if (e.target.classList.contains("p-dialog-mask")) {
      setReplaceDataModal(false);
    }
  }

  const tableSettingDialogCloseHandler = (e: any) => {
    if (e.target.classList.contains("p-dialog-mask")) {
      setSettingDataModal(false);
    }
  }

  const columnDeleteDialogCloseHandler = (e: any) => {
    if (e.target.classList.contains("p-dialog-mask")) {
      deleteColumnHandler();
    }
  }

  const noDataDialogCloseHandler = (e: any) => {
    if (e.target.classList.contains("p-dialog-mask")) {
      setNoDataModal(false);
    }
  }

  const csvFileUploadHandler = (e: any, setFieldValue: any) => {
    {
      setFieldValue("file", e.currentTarget.files[0]);
    }
  }

  const CSVUploadSubmitHandler = (getData: any) => {
    // console.log(getData);
    return router.push('/product');
  }

  const csvFileName = (value: any) => {
    if (value && value.file) {
        // return "File Name:- " + value.file.name
        return "File Name:- New Contacts.CSV"
    }
  }

  return (
    <DashboardLayout sidebar={false}>
      <div className={styles.topBar}>
        <h5>My Registry</h5>
        <div className={styles.btnGroup}>
          <Menubar
            model={items}
            className={styles.menubar}
          />
        </div>
      </div>
      <div className={layoutStyles.box}>
        <div className={layoutStyles.headContentBox}>
          <div className={layoutStyles.head}>
            <h4>Table of Contact</h4>
            <div className={layoutStyles.editButtons}>
              <button onClick={() => setSettingDataModal(true)} className={layoutStyles.blueBtn}>Table Settings</button>
              <button onClick={() => setAddNewFieldModal(true)} className={layoutStyles.blueBgBtn}>Add New Field</button>
            </div>
          </div>
          <div className={styles.contectTableBox}>
            <div className={styles.contectTableOverflow}>
              {
                createContactTableSpinner ? <div className={styles.formSpinner}>
                  <div className={styles.loading}></div>
                </div> : null
              }
              {
                contacts.length ?
                  <table className={styles.contectTable}>
                    <thead>
                      <tr>
                        <th>id</th>
                        {
                          Object.keys(contacts[0]).map(function (key, index) {
                            if (key != 'id') {
                              return <th key={"tableTh" + index}>{key}</th>
                            }
                          })
                        }
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        contacts.map((el, i) => {
                          return <tr key={"contact" + i}>
                            <td>{i + 1}</td>
                            {
                              Object.keys(el).map(function (key, index, array) {
                                if (key != "id" || index == array.length - 1) {
                                  if (index == array.length - 1) {
                                    return <React.Fragment key={"tableTdLast" + index + i}>
                                      {
                                        key != "id" ? <td>{`${contacts[i][key]}`}</td> : null
                                      }
                                      <td><button className={layoutStyles.blueTextBtn} onClick={() => editContactFiledHandler(contacts[i].id)}>Edit</button></td>
                                    </React.Fragment>
                                  }
                                  return <td key={"tableTd" + index + i}>{`${contacts[i][key]}`}</td>
                                }
                              })
                            }
                          </tr>
                        })
                      }
                    </tbody>
                  </table>
                  : <p className='p-text-center'>No data found</p>
              }
            </div>

            {
              Math.ceil(totalRecords / perPage) >= 1 && contacts.length ?
                <CustomPagination totalRecords={totalRecords} currentPage={currentPage} perPage={perPage} currentPageHandler={currentPageHandler} perPageHandler={perPageHandler} />
                : ''
            }

            {/* Create-Contact-Modal */}
            <Dialog showHeader={false} onMaskClick={createContactDialogCloseHandler} className={styles.createNewContactCustomStyles} maskClassName={styles.dialogMask} position={'right'} visible={createNewContactModal} style={{ width: '500px', }} onHide={() => ''}>
              <div className={styles.createContactModal}>
                <h5>Create new contact</h5>
                {
                  initialValues && types ?
                    <Formik
                      enableReinitialize
                      initialValues={initialValues}
                      validate={(values) => {
                        let error: any = {};
                        Object.keys(values).map(el => {
                          if (types[el].toLowerCase() !== "checkbox") {
                            if (types[el].toLowerCase() == "number") {
                              var reg = /^\d+$/
                              if (!reg.test(values[el]) || !values[el]) {
                                error[el] = "Please enter number";
                              }
                            } else if (!values[el]) {
                              error[el] = "Please enter value";
                            }
                          }
                        })
                        return error;
                      }}
                      onSubmit={(
                        values: DynamicFields,
                        { setSubmitting }: FormikHelpers<DynamicFields>
                      ) => {
                        createNewContactHanler(JSON.stringify(values, null, 2));
                        setSubmitting(false);
                      }}
                    >
                      {props => (
                        <form onSubmit={props.handleSubmit}>
                          <FieldArray
                            name="contact"
                            render={arrayHelpers => (
                              <div className={styles.contactFields}>
                                {
                                  createContactSpinner ? <div className={styles.formSpinner}>
                                    <div className={styles.loading}></div>
                                  </div> : null
                                }
                                {
                                  Object.keys(props.values).map(function (key, index) {
                                    if (key.toLowerCase() == "id") {
                                      return false
                                    }
                                    return <div className={styles.inputBox} key={"contactField" + index}>
                                      <label>{key}</label>
                                      {
                                        contactFieldsTypeHandler(key)
                                      }
                                    </div>
                                  })
                                }
                              </div>
                            )}
                          />
                          <div className="p-d-flex p-ai-center p-mt-4">
                            {
                              contactDataUpdated ? <button type="button" className={layoutStyles.customBluebtn}>See original details</button> : null
                            }
                            <div className="p-ml-auto">
                              <button type='submit' className={layoutStyles.customBlueBgbtn}>Save</button>
                              <button type='button' onClick={emptyContactFiledHandler} className={layoutStyles.customDarkBgbtn}>Cancel</button>
                            </div>
                          </div>
                        </form>
                      )}
                    </Formik> : null
                }
              </div>
            </Dialog>

            {/* Add New Field-Modal */}
            <Dialog showHeader={false} onMaskClick={addNewFieldDialogCloseHandler} contentClassName={styles.addNewFieldModalCustomStyles} maskClassName={styles.dialogMask} visible={addNewFieldModal} style={{ width: '500px', }} onHide={() => ''}>
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

            {/* Replace data-Modal */}
            <Dialog showHeader={false} onMaskClick={replaceDataDialogCloseHandler} contentClassName={styles.addNewFieldModalCustomStyles} maskClassName={styles.dialogMask} visible={replaceDataModal} style={{ width: '500px', }} onHide={() => ''}>
              <div className={styles.addNewFieldModal}>
                <Formik
                  enableReinitialize
                  initialValues={{
                    replace_from: '',
                    replace_to: '',
                    column: contacts[0] ? Object.keys(contacts[0])[0] : ''
                  }}
                  validationSchema={replaceValueSchema}
                  onSubmit={(
                    values: ReplaceData,
                    { setSubmitting }: FormikHelpers<ReplaceData>
                  ) => {
                    replacedataSaveBtnHandler(JSON.stringify(values, null, 2));
                    setSubmitting(false);
                  }}
                >
                  {props => (
                    <form onSubmit={props.handleSubmit}>
                      {
                        replaceDataSpinner ? <div className={styles.formSpinner}>
                          <div className={styles.loading}></div>
                        </div> : null
                      }
                      <div className={styles.replaceDataModal}>
                        <h5>Replace Data</h5>
                        <div className={styles.inputFields}>
                          <div className={styles.replaceFields}>
                            <div className={styles.inputBox}>
                              <label htmlFor="selectdata">Select data</label>
                              <Field type="text" name="replace_from" />
                              <ErrorMessage name="replace_from">
                                {(msg) => <p className={styles.error}>{msg}</p>}
                              </ErrorMessage>
                            </div>
                            <AiOutlineSwap className={styles.swapIcon} />
                            <div className={styles.inputBox}>
                              <label htmlFor="changeto">Change to</label>
                              <Field type="text" name="replace_to" />
                              <ErrorMessage name="replace_to">
                                {(msg) => <p className={styles.error}>{msg}</p>}
                              </ErrorMessage>
                            </div>
                          </div>
                          <div className={styles.inputBox + ' ' + styles.radioBox}>
                            <div className="p-d-flex p-ai-center p-mr-2">
                              <RadioButton className={styles.checkBoxes} inputId="specificcolumn" name="replacedata" value="specificcolumn" checked={replaceColumn} onChange={(e) => { setReplaceColumn(true); props.setFieldValue('column', Object.keys(contacts[0])[0]) }} />
                              <label htmlFor="specificcolumn">Replace data on specific column</label>
                            </div>
                            <div className="p-d-flex p-ai-center">
                              <RadioButton className={styles.checkBoxes} inputId="wholeregistry" name="replacedata" value="wholeregistry" checked={!replaceColumn} onChange={(e) => { setReplaceColumn(false); props.setFieldValue('column', '') }} />
                              <label htmlFor="wholeregistry">Replace data on whole registry</label>
                            </div>
                          </div>

                          {
                            replaceColumn ? <div className={styles.inputBox}>
                              <Dropdown id="inviteRole" className={styles.selectBox} name="column" value={props.values.column} options={Object.keys(contacts[0])} onChange={(e: any) => props.setFieldValue('column', e.target.value)} />
                              <ErrorMessage name="column">
                                {(msg) => <p className={styles.error}>{msg}</p>}
                              </ErrorMessage>
                            </div> : null
                          }

                          <div className="p-d-flex p-ai-center p-mt-4">
                            <div className="p-m-auto">
                              <button type='submit' className={layoutStyles.customBlueBgbtn}>Save</button>
                              <button type='button' onClick={() => setReplaceDataModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </Formik>
              </div>
            </Dialog>

            {/* Table Setting data-Modal */}
            <Dialog showHeader={false} onMaskClick={tableSettingDialogCloseHandler} contentClassName={styles.addNewFieldModalCustomStyles} maskClassName={styles.dialogMask} visible={settingDataModal} style={{ width: '600px', }} onHide={() => ''}>
              <div className={styles.addNewFieldModal}>
                {
                  editColumnModalSpinner ? <div className={styles.formSpinner}>
                    <div className={styles.loading}></div>
                  </div> : null
                }
                <div className={styles.replaceDataModal + " " + styles.tableSettings}>
                  <h5>
                    Table Setting
                  </h5>
                  <DragDrop tasks={columns} setColumns={setColumns} editHandler={columnEditHandler} setEditNameHandler={setEditNameHandler} saveColumnHandler={saveColumnHandler} setDeleteColumnModal={setDeleteColumnModal} setDeleteColumnName={setDeleteColumnName} hideShowColumnHandler={hideShowColumnHandler} />
                </div>
              </div>
            </Dialog>

            {/* column delete modal */}
            <Dialog showHeader={false} onMaskClick={columnDeleteDialogCloseHandler} contentClassName={styles.addNewFieldModalCustomStyles} maskClassName={styles.dialogMask} visible={deleteColumnModal} style={{ width: '600px', }} onHide={() => ''}>
              <div className={styles.addNewFieldModal}>
                {
                  deleteColumnModalSpinner ? <div className={styles.formSpinner}>
                    <div className={styles.loading}></div>
                  </div> : null
                }
                <div className={styles.deleteColumn}>
                  <h5>Delete Column</h5>
                  <div className={styles.inputFields}>
                    <div className="p-text-center">
                      <h3 className='p-mt-0'>Are you sure you want to delete the column ?</h3>
                      <div className={styles.radioBox}>
                        <Checkbox inputId='deleteCheck' className={styles.deleteCheckbox + " p-deleteCheckbox"} onChange={e => setDeleteFromDatabase(e.checked)} checked={deleteFromDatabase}></Checkbox>
                        <label htmlFor="deleteCheck">Delete specific column data from database as well</label>
                      </div>
                    </div>
                    <div className="p-d-flex p-ai-center p-mt-4">
                      <div className="p-m-auto">
                        <button type='button' onClick={() => { setDeleteColumnName(null); setDeleteFromDatabase(false); setDeleteColumnModal(false) }} className={layoutStyles.customBluebtn} >Cancel</button>
                        <button type='button' onClick={deleteColumnHandler} className={layoutStyles.customBlueBgbtn}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Dialog>

            {/* No data upload csv modal */}
            <Dialog showHeader={false} onMaskClick={noDataDialogCloseHandler} contentClassName={styles.addNewFieldModalCustomStyles} maskClassName={styles.dialogMask} visible={noDataModal} style={{ width: '600px', }} onHide={() => ''}>
              <div className={styles.addNewFieldModal}>
                {
                  noDataModalSpinner ? <div className={styles.formSpinner}>
                    <div className={styles.loading}></div>
                  </div> : null
                }
                <Formik
                  enableReinitialize
                  validationSchema={yup.object().shape({
                    file: yup.mixed().required("Please upload CSV file").test("type", "Only CSV format is accepted", (value) => {
                      return value && (
                        value.type === "application/vnd.ms-excel"
                      );
                    }),
                  })}
                  initialValues={{ file: null }}
                  onSubmit={(
                    values: CSVUpload | null,
                    { setSubmitting }: FormikHelpers<CSVUpload>
                  ) => {
                    CSVUploadSubmitHandler(values);
                    setSubmitting(false);
                  }}
                >
                  {props => (
                    <form onSubmit={props.handleSubmit}>
                      <div className={styles.CSVUpload}>
                        <h5>Upload CSV</h5>
                        <div className={styles.inputFields}>
                          <div className="p-text-center">
                            <label
                              htmlFor="CSVFileUpload"
                              className="button">
                                <FiUpload />
                              Upload an image
                            </label>
                            <p className={styles.fileName}>{ csvFileName(props.values) }</p>
                            <input id="CSVFileUpload" name="file" type="file" accept=".csv" onChange={(e) => csvFileUploadHandler(e, props.setFieldValue)} className={styles.CSVFileUpload} />
                            
                            <ErrorMessage name="file">
                              {(msg) => <p className={styles.error}>{msg}</p>}
                            </ErrorMessage>
                          </div>
                          <div className="p-d-flex p-ai-center p-mt-4">
                            <div className="p-m-auto">
                              <button type='button' onClick={() => { setDeleteColumnName(null); setDeleteFromDatabase(false); setNoDataModal(false) }} className={layoutStyles.customBluebtn} >Cancel</button>
                              <button type='submit' className={layoutStyles.customBlueBgbtn}>Upload</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </Formik>
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default withProtectSync(Dashboard)

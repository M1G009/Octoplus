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
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

// 3rd Party Imports
import * as yup from 'yup';
import { AiOutlineSwap } from "react-icons/ai";
import { ErrorMessage, Formik, FieldArray, Field, FormikHelpers } from 'formik';
import { FaSearch, FaExclamationTriangle } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { InputText } from 'primereact/inputtext';
import { FiFilter } from "react-icons/fi";
import { FaCog } from "react-icons/fa";
import { RiCloseLine } from "react-icons/ri";
import { ToastContainer } from "react-toastify";
import toast from "../components/Toast";
import DragDrop from '../components/DragDrop'

// Style and Component Imports
import CustomPagination from '../components/CustomPagination'
import { withProtectSync } from "../utils/protect"
import DashboardLayout from '../components/DashboardLayout';
import layoutStyles from '../styles/Home.module.scss';
import styles from '../styles/registry.module.scss';

// Interface/Helper Imports
import service from '../helper/api/api';
import { AddNewFiled, ReplaceData, DynamicFields, columnsHideShowFileds, TableColumns, CSVUpload } from '../interface/registry'

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { query } = router;
  const [noDataModal, setNoDataModal] = useState(false);
  const [noDataModalSpinner, setNoDataModalSpinner] = useState(false);
  const [addFiledSpinner, setAddFiledSpinner] = useState(false);
  const [replaceDataSpinner, setReplaceDataSpinner] = useState(false);
  const [settingDataModal, setSettingDataModal] = useState(false);
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
  const [viewData, setViewData] = useState(false)
  const [editData, setEditData] = useState(false)
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState<any>(1)
  const [filterData, setFilterData] = useState(false);
  const [checkFilter, setCheckFilter] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [removeSearch, setRemoveSearch] = useState('');
  const [newFieldsOption, setNewFieldsOption] = useState([])

  // Types Values
  const [addOptionInputValue, setAddOptionInputValue] = useState<string>('')

  // Paginations and Filter States
  const [totalRecords, setTotalRecords] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortingField, setSortingField] = useState<object | string>('');
  const [filterFields, setFilterFields] = useState('');
  const [searchField, setSearchField] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [dataType, setDataType] = useState(["text", "email", "date", "number", "textarea", "radio", "select", "checkbox"])
  // const [dataType, setDataType] = useState(["text", "email", "date", "number", "textarea", "checkbox", "radio", "select"])
  const [contacts, setContacts] = useState<any[]>([]);
  const [showFieldsData, setShowFieldsData] = useState<any>(null);
  const [replaceColumn, setReplaceColumn] = useState(true)
  const [registryId, setRegistryId] = useState('')
  const [restoreCheck, setRestoreCheck] = useState(false)
  const [noCsvError, setNoCsvError] = useState(false)

  const fetchAllContact = async (page: number, limit: number, filter: any, search: string, sort: any) => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }
      setCreateContactTableSpinner(true)
      let query = `page=${page}&limit=${limit}`;
      if (filter && Object.keys(filter).length) {
        let checkString = filter;
        for (const key in checkString) {
          if (types && types[key].type == "number") {
            checkString[key] = checkString[key] * 1;
          }
        }
        query = query + `&filter=${JSON.stringify(checkString)}`;
      }
      if (search) {
        query = query + `&search=${JSON.stringify(search)}`;
      }
      if (Object.keys(sort).length) {
        query = query + `&sort=${JSON.stringify(sort)}`;
      }

      const { data } = await service({
        url: `https://octoplusapi.herokuapp.com/getregistry?${query}`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });
      if (data) {
        if (data.message == "No registry available") {
          setNoDataModal(true)
        }
        if (!data.data || !data.data.registry || !data.data.registry.length) {

        } else if (data.data.registry.length == 1) {
          let singleData = { ...data.data.registry[0] }
          Object.keys(singleData).map(el => {
            if (el == "id") {
              delete singleData["id"]
            } else if (!singleData[el]) {
              delete singleData[el]
            }
            if (Object.keys(singleData).length == 0) {
              setNoDataModal(true)
            }
          })

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
        setShowFieldsData(data.data.show)
        setTotalRecords(data.data.total_rows)
        setRegistryId(data.data.registry_id)
      }
      setCreateContactTableSpinner(false)
    } catch (err) {
      setCreateContactTableSpinner(false)
      return await toast({ type: "error", message: err });
    }
  }

  useEffect(() => {
    async function fetchAllContactData() {
      if (window.location.href) {
        // const urlSearchParams = new URLSearchParams(window.location.search);
        // const queryObj = Object.fromEntries(urlSearchParams.entries())
        if (query) {
          let allQuery: any = query;
          let filter: any = {};
          let search: string = '';
          let sort: any = {};
          let sortObj: any = {};

          for (const key in allQuery) {
            if (key == "search") {
              search = allQuery[key];
            } else if (key.startsWith("sort-")) {
              let stringKey: any = key.split('sort-')[1];
              sort[stringKey] = allQuery[key];
            } else {
              filter[key] = allQuery[key];
            }
          }
          if (Object.keys(filter).length) {
            setCheckFilter(true);
            setFilterFields(filter);
          } else {
            setCheckFilter(false);
            setFilterFields('')
          }
          if (search) {
            setSearchField(`${search}`);
            setSearchInput(`${search}`);
            setRemoveSearch(`${search}`);
          } else {
            setSearchField('');
            setSearchInput('');
            setRemoveSearch('')
          }
          if (Object.keys(sort).length) {
            let key: any = Object.keys(sort)[0];
            let value: any = sort[Object.keys(sort)[0]] * 1;
            sortObj = { [key]: value }
            if (value == 1 || value == -1) {
              setSortField(key);
              setSortOrder(value);
              setSortingField(sortObj);
            } else {
              setSortField('');
              setSortOrder(0);
              setSortingField('');
            }
          } else {
            setSortField('');
            setSortOrder(0);
            setSortingField('');
          }
          fetchAllContact(currentPage, perPage, filter, `${search}`, sortObj);
        } else {
          await fetchAllContact(currentPage, perPage, filterFields, searchField, sortingField);
        }
      }
    }
    fetchAllContactData();

  }, [currentPage, perPage, query])


  const validationSchema = yup.object().shape({
    column: yup.string().required('Please field name')
  });

  const replaceValueSchema = yup.object().shape({
    replace_from: yup.string().trim().required('Please enter select data'),
    replace_to: yup.string().trim().required('Please enter change to'),
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
      command: () => { setEditData(false); setViewData(false); setCreateNewContactModal(true) }
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
      var link = window.document.createElement("a");
      link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURI(data.data));
      link.setAttribute("download", "Registry.csv");
      link.click();

    } catch (err) {
      return await toast({ type: "error", message: err });
    }
  }

  const checkBoxHandler = (setHandler: any, key: any, event: any, prevVal: any) => {
    let previousArray = [...prevVal]
    if(event.target.checked){
      previousArray.push(event.target.value);
    } else {
      let index = previousArray.indexOf(event.target.value);
      previousArray.splice(index, 1)
    }
    setHandler(key, previousArray)
    
  }

  const contactFieldsTypeHandler = (key: string, props: any) => {
    if (types) {

      if (types[key].type.toLowerCase() == "textarea") {
        return <div>
          <Field name={key}>
            {({ field }: any) => (
              <textarea {...field} readOnly={viewData} />
            )}
          </Field>
          <ErrorMessage name={key}>
            {(msg) => <p className={styles.error}>{msg}</p>}
          </ErrorMessage>
        </div>
      } else if (types[key].type.toLowerCase() == "radio") {
        return <div>
          {
            types[key].options.map((el, i) => {
              return <Field name={key} key={el + i}>
                {({ field }: any) => (
                  <>
                    {el}
                    <RadioButton className='p-mr-2 p-ml-1' {...field} checked={field.value == el} readOnly={viewData} value={el} onChange={(e) => props.setFieldValue(key, e.target.value)} ></RadioButton>
                  </>
                )}
              </Field>
            })
          }
          <ErrorMessage name={key}>
            {(msg) => <p className={styles.error}>{msg}</p>}
          </ErrorMessage>
        </div>
      } else if (types[key].type.toLowerCase() == "select") {
        return <div>
          <Field name={key}>
            {({ field }: any) => (
              <Dropdown {...field} value={field.value} options={types[key].options} className='p-mr-2 p-ml-1' onChange={(e) => props.setFieldValue(key, e.target.value)} />
            )}
          </Field>
          <ErrorMessage name={key}>
            {(msg) => <p className={styles.error}>{msg}</p>}
          </ErrorMessage>
        </div>
      } else if (types[key].type.toLowerCase() == "checkbox") {
        return <div>
          {
            types[key].options.map((el, i) => {
              return <Field name={key} key={el + i}>
                {({ field }: any) => (
                  <>
                    {el}
                    <Checkbox className='p-mr-2 p-ml-1' {...field} checked={field.value.includes(el)} readOnly={viewData} value={el} onChange={(e) => checkBoxHandler(props.setFieldValue, key, e, field.value)} ></Checkbox></>
                )}
              </Field>
            })
          }
          <ErrorMessage name={key}>
            {(msg) => <p className={styles.error}>{msg}</p>}
          </ErrorMessage>
        </div>
      }
      return <div>
        <Field type={types[key].type.toLowerCase()} readOnly={viewData} name={key} />
        <ErrorMessage name={key}>
          {(msg) => <p className={styles.error}>{msg}</p>}
        </ErrorMessage>
      </div>
    }
  }

  const emptyContactFiledHandler = () => {
    let values = { ...showFieldsData };
    Object.keys(values).map(key => {
      values[key] = '';
    })
    setEditContactRowId(null);
    setInitialValues(values);
    setFilterData(false);
    setCreateNewContactModal(false);
  }

  const setRoutingQuery = (filter: any, search: any, sort: any) => {
    let queryObj: any = { search };
    for (const key in filter) {
      if (filter[key]) {
        queryObj[key] = filter[key];
      }
    }
    for (const key in sort) {
      if (sort[key]) {
        queryObj[`sort-${key}`] = sort[key];
      }
    }

    for (const propName in queryObj) {
      if (!queryObj[propName]) {
        delete queryObj[propName];
      }
    }
    return router.push({
      pathname: '/',
      query: queryObj,
    })
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

      if (filterData) {
        let filterObj = JSON.parse(getData);
        for (var propName in filterObj) {
          let value;
          if (typeof value == "string") {
            value = filterObj[propName].trim();
          } else {
            value = filterObj[propName];
          }
          if (!value || filterObj[propName] == null || filterObj[propName] == undefined) {
            delete filterObj[propName];
          }
        }
        if (Object.keys(filterObj).length) {
          setCheckFilter(true);
          setCurrentPage(1);
          setRoutingQuery(filterObj, searchField, sortingField);
          setCheckFilter(true);
        }
      } else {
        let parseData = JSON.parse(getData);
        if (Object.keys(parseData).length) {
          if (editContactRowId) {
            let editObj = Object.assign(parseData, { "row_id": editContactRowId });
            const { data } = await service({
              url: `https://octoplusapi.herokuapp.com/edit_feild`,
              method: 'POST',
              data: editObj,
              headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });
            await fetchAllContact(currentPage, perPage, filterFields, searchField, sortingField);
          } else {

            Object.keys(parseData).map(el => {
              if (`${parseData[el]}`.trim() == "") {
                delete parseData[el];
              }
            })
            const { data } = await service({
              url: `https://octoplusapi.herokuapp.com/insert_registry`,
              method: 'POST',
              data: { insert: [parseData] },
              headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });
            setRoutingQuery(filterFields, '', sortingField);
            await fetchAllContact(currentPage, perPage, filterFields, '', sortingField);
          }
        }
      }
      setCreateContactSpinner(false)
      setCreateNewContactModal(false)
      setFilterData(false);
      setEditContactRowId(null);

    } catch (err) {
      setCreateContactSpinner(false)
      setCreateNewContactModal(false)
      setEditContactRowId(null);
      setFilterData(false);
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

      let newData = { ...getData };

      if (newData.dtype == "select" || newData.dtype == "radio" || newData.dtype == "checkbox") {
        newData.dtype = { type: newData.dtype, options: newFieldsOption }
        if (!newFieldsOption.length) {
          return await toast({ type: "error", message: "Please enter options" })
        }
      } else {
        newData.dtype = { type: newData.dtype, options: [] }
      }
      setAddFiledSpinner(true)
      let { data } = await service({
        url: `https://octoplusapi.herokuapp.com/add_feild`,
        method: 'POST',
        data: JSON.stringify(newData),
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });
      setAddFiledSpinner(false)
      setAddNewFieldModal(false)
      setNewFieldsOption([])
      return await fetchAllContact(currentPage, perPage, filterFields, searchField, sortingField);
    } catch (err) {
      setAddFiledSpinner(false)
      setAddNewFieldModal(false)
      setNewFieldsOption([])
      return await toast({ type: "error", message: err });
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
      let data = await service({
        url: `https://octoplusapi.herokuapp.com/replace_registry`,
        method: 'POST',
        data: replacedata,
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });
      setReplaceDataSpinner(false)
      setReplaceDataModal(false)
      return await fetchAllContact(currentPage, perPage, filterFields, searchField, sortingField);
    } catch (err) {
      setReplaceDataSpinner(false)
      setReplaceDataModal(false)
      return await toast({ type: "error", message: err });
    }
  }

  const editContactFiledHandler = async (id: any, view: Boolean) => {
    try {
      setRestoreCheck(false);
      if (view) {
        setEditData(false);
        setViewData(true);
      } else {
        setViewData(false);
        setEditData(true);
      }
      let copyObj = [...contacts].slice().find(el => el.id == id);
      var checkId = Object.assign({}, copyObj);
      setEditContactRowId(id);
      delete checkId.id;

      setInitialValues(checkId);
      setCreateNewContactModal(true);

      if (view) {
        let authToken = await window.localStorage.getItem('authToken');

        if (!authToken) {
          window.localStorage.removeItem("authToken")
          window.localStorage.removeItem("ValidUser")
          window.localStorage.removeItem('loginUserdata');
          return router.push('/auth');
        }

        setCreateContactSpinner(true)

        let { data } = await service({
          url: `https://octoplusapi.herokuapp.com/orignal`,
          method: 'POST',
          data: JSON.stringify({ registry_id: registryId, row_id: id }),
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
        });
        if (data.data) {
          if (data.data[0].previous.length && data.data[0].current) {
            setRestoreCheck(true);
          }
        }
        setCreateContactSpinner(false)
      }
    } catch (err) {
      setCreateContactSpinner(false)
      return await toast({ type: "error", message: err });
    }

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
          let data = await service({
            url: `https://octoplusapi.herokuapp.com/rename`,
            method: 'POST',
            data: { "column": findObj.name, "rename": findObj.editedName },
            headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
          });
          setEditColumnModalSpinner(false);
          return await fetchAllContact(currentPage, perPage, filterFields, searchField, sortingField);
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
        let getdata = await service({
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

        let columndata = await service({
          url: `https://octoplusapi.herokuapp.com/columnorder`,
          method: 'POST',
          data: { columns: columnsOrder },
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
        });
      }
      setEditColumnModalSpinner(false);
      return await fetchAllContact(currentPage, perPage, filterFields, searchField, sortingField);
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

        let deletedata = await service({
          url: `https://octoplusapi.herokuapp.com/delete_feild`,
          method: 'POST',
          data: columnName,
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
        });
      }

      setDeleteColumnName(null);
      setDeleteColumnModalSpinner(false)
      setDeleteColumnModal(false);
      return await fetchAllContact(currentPage, perPage, filterFields, searchField, sortingField);
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
      setDeleteColumnName(null);
      setDeleteFromDatabase(false);
      setDeleteColumnModal(false)
    }
  }

  const noDataDialogCloseHandler = (e: any) => {
    if (e.target.classList.contains("p-dialog-mask")) {
      // setNoDataModal(false);
      setNoCsvError(true)
      setTimeout(() => setNoCsvError(false), 3000)
    }
  }

  const csvFileUploadHandler = (e: any, setFieldValue: any) => {
    setFieldValue("file", e.currentTarget.files[0]);
  }

  const CSVUploadSubmitHandler = async (getData: any) => {
    try {

      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      setNoDataModalSpinner(true);

      let newCSVForm = new FormData();
      newCSVForm.append('registry', getData.file);

      const { data } = await service({
        url: `https://octoplusapi.herokuapp.com/create_registry`,
        method: 'POST',
        data: newCSVForm,
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': JSON.parse(authToken) }
      });
      setNoDataModalSpinner(false);
      setNoDataModal(false)
      return await fetchAllContact(currentPage, perPage, filterFields, searchField, sortingField);

    } catch (err) {
      setNoDataModalSpinner(false);
      setNoDataModal(false)
      return await toast({ type: "error", message: err });
    }
  }

  const csvFileName = (value: any) => {
    if (value && value.file) {
      // return "File Name:- " + value.file.name
      return "File Name:- New Contacts.CSV"
    }
  }

  const idRegistryHandler = (rowData: any, field: any) => {
    return field.rowIndex + 1
  }

  const editRegistryHandler = (rowData: any) => {

    return (
      <>
        <button className={layoutStyles.blueTextBtn} onClick={() => editContactFiledHandler(rowData.id, false)}>Edit</button> <button className={layoutStyles.blueTextBtn} onClick={() => editContactFiledHandler(rowData.id, true)}>View</button>
      </>)
  }

  const editRegistryTextHandler = (rowData: any, el: any) => {
    return (
      <>
        {
          (!rowData[el] || rowData[el] === "null" || rowData[el] === "Null") ? " "
            :
            <>
              <p className={styles.tableTdData}>{`${rowData[el]}`}</p> <span>{`${rowData[el]}`}</span>
            </>
        }
      </>)
  }

  const onSortHandler = async (e: any) => {
    setSortField(e.sortField);
    setSortOrder(e.sortOrder);
    let sortObj;
    if (e.sortOrder == 0) {
      setRoutingQuery(filterFields, searchField, '');
    } else {
      sortObj = { [e.sortField]: e.sortOrder };
      setRoutingQuery(filterFields, searchField, sortObj);
    }
  }

  const updateFilterHandler = () => {
    setFilterData(true);
    setCreateNewContactModal(true);
    let filterData: any = filterFields;
    let initialFields = { ...initialValues };
    Object.keys(filterData).map(el => {
      initialFields[el] = filterData[el];
    })
    setInitialValues(initialFields)
  }

  const originalDetailsHandler = () => {
    return router.push(`/tools/csv-compare/restore?registry_id=${registryId}&row_id=${editContactRowId}`);
  }

  const searchEnterHandler = (e: any) => {
    if (e.key === 'Enter') {
      setRemoveSearch(searchInput);
      setRoutingQuery(filterFields, searchInput, sortingField);
    }
  }

  const addOptionsInNewFields = () => {
    if (addOptionInputValue) {
      let optionsCopy: any = [...newFieldsOption];
      if(!optionsCopy.includes(addOptionInputValue)){
        optionsCopy.push(addOptionInputValue);
        setNewFieldsOption(optionsCopy)
        setAddOptionInputValue('')
      }
    }
  }

  const deleteNewFieldsOptionHandler = (i: number) => {
    let optionsCopy: any = [...newFieldsOption];
    optionsCopy.splice(i, 1);
    setNewFieldsOption(optionsCopy)
  }

  return (
    <>
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
      <DashboardLayout sidebar={false}>
        <div className={styles.topBar}>
          <h5>My Registry</h5>
          <div className={styles.btnGroup}>
            {
              contacts.length ? <Menubar
                model={items}
                className={styles.menubar}
              /> : ''
            }
          </div>
        </div>
        <div className={layoutStyles.box}>
          <div className={layoutStyles.headContentBox}>
            <div className={layoutStyles.head}>
              <h4>Table of Contact</h4>
              <div className={layoutStyles.editButtons}>
                <div className={"p-inputgroup " + styles.searchFilter}>
                  <InputText placeholder="Search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={searchEnterHandler} />
                  {
                    removeSearch && removeSearch == searchInput ?
                      <button onClick={() => {
                        setSearchInput(''); setRemoveSearch('');
                        setRoutingQuery(filterFields, '', sortingField);
                      }}><MdClose /></button>
                      :
                      <button onClick={() => {
                        setRemoveSearch(searchInput);
                        setRoutingQuery(filterFields, searchInput, sortingField);
                      }}><FaSearch /></button>
                  }
                </div>
                {
                  checkFilter ?
                    <div className={'p-d-flex ' + styles.filterBtnGroup}>
                      <button onClick={updateFilterHandler} className={styles.filterBtn}>Update <FiFilter /></button>
                      <button onClick={() => setRoutingQuery('', searchField, sortingField)} className={styles.filterBtn}><RiCloseLine /></button>
                    </div>
                    :
                    <button onClick={() => { setFilterData(true); setCreateNewContactModal(true) }} className={layoutStyles.blueBtn + " " + styles.filterBtn}>Filter <FiFilter /></button>
                }
                <button onClick={() => setSettingDataModal(true)} className={layoutStyles.blueTextBtn}>Table Settings <FaCog /></button>
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
                  showFieldsData ?
                    <DataTable className='registryDataTable' value={contacts} removableSort responsiveLayout="scroll" sortField={sortField} sortOrder={sortOrder} onSort={onSortHandler}>
                      <Column header="Id" body={idRegistryHandler}></Column>
                      {
                        Object.keys(showFieldsData).map((el, i) => {
                          if (el === "id") {
                            return false;
                          }
                          return <Column key={"registrycolumn" + i} field={el} header={el} body={(e) => editRegistryTextHandler(e, el)} sortable></Column>
                        })
                      }
                      <Column header="Actions" body={editRegistryHandler}></Column>
                    </DataTable>
                    : <p className='p-text-center'>No data found</p>
                }
              </div>

              {
                Math.ceil(totalRecords / perPage) >= 1 && contacts.length ?
                  <CustomPagination totalRecords={totalRecords} currentPage={currentPage} perPage={perPage} currentPageHandler={currentPageHandler} perPageHandler={perPageHandler} />
                  : ''
              }

              {/* Edit View Filter Data Field-Modal */}
              <Dialog showHeader={false} onMaskClick={createContactDialogCloseHandler} className={styles.createNewContactCustomStyles} maskClassName={styles.dialogMask} position={'right'} visible={createNewContactModal} style={{ width: '500px', }} onHide={() => ''}>
                <div className={styles.createContactModal}>
                  <h5>{editData ? "Edit Contact" : (viewData ? "View Data" : (filterData ? "Filter Data" : "Create New Contact"))}</h5>
                  {
                    initialValues && types ?
                      <Formik
                        enableReinitialize={!viewData}
                        initialValues={initialValues}
                        validate={(values: any) => {
                          let error: any = {};
                          if (filterData || editData) {
                            return
                          } else {
                            if (!viewData) {
                              Object.keys(values).map((el: any) => {
                                if (el == "First Name" || el == "Last Name" || el == "Email" || el == "Contact") {
                                  if (!values[el]) {
                                    if (el == "First Name") {
                                      error[el] = "Please enter first name";
                                    } else if (el == "Last Name") {
                                      error[el] = "Please enter last name";
                                    } else if (el == "Email") {
                                      error[el] = "Please enter email";
                                    } else if (el == "Contact") {
                                      error[el] = "Please enter contact";
                                    } else {
                                      error[el] = "Please enter valid value";
                                    }
                                  } else if (el == "Email") {
                                    var emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                    if (!emailPattern.test(values[el])) {
                                      error[el] = "Please enter valid email 2";
                                    }
                                  } else if (el == "First Name" || el == "Last Name") {
                                    var namePattern = /^[A-Za-z ]*$/;
                                    if (!namePattern.test(values[el])) {
                                      error[el] = "Please enter valid value";
                                    }
                                  } else if (el == "Contact") {
                                    var contactPattern = /^[0-9\.\-\.\+\.\)\.\(\/]+$/;
                                    if (!contactPattern.test(values[el])) {
                                      error[el] = "Please enter valid contact";
                                    }
                                  }
                                }
                              })
                              return error;
                            }
                          }
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
                                          contactFieldsTypeHandler(key, props)
                                        }
                                      </div>
                                    })
                                  }
                                </div>
                              )}
                            />
                            <div className="p-d-flex p-ai-center p-mt-4 p-jc-end">
                              {
                                viewData && restoreCheck ? <button type="button" className={layoutStyles.customBluebtn} onClick={() => originalDetailsHandler()}>See Version History</button> : null
                              }
                              <div className="">
                                {
                                  !viewData ? (filterData ? <button type='submit' className={layoutStyles.customBlueBgbtn}>Apply Filter</button> : <button type='submit' className={layoutStyles.customBlueBgbtn}>Save</button>) : ''
                                }
                                <button type='button' onClick={emptyContactFiledHandler} className={layoutStyles.customDarkBgbtn}>{viewData ? "Close" : "Cancel"}</button>
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
                      addNewFiledHandler(values);
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
                            <Dropdown id="inviteRole" className={styles.selectBox} name="dtype" value={props.values.dtype} options={dataType} onChange={(e: any) => { props.setFieldValue('dtype', e.target.value); setNewFieldsOption([]); setAddOptionInputValue(''); }} />
                          </div>
                          {
                            (props.values.dtype == "select" || props.values.dtype == "radio" || props.values.dtype == "checkbox") ?
                              <div className={styles.inputBox}>
                                <label htmlFor="dataType">Options</label>
                                <div className="col-12">
                                  <div className="p-inputgroup">
                                    <InputText placeholder="Add Option" value={addOptionInputValue} onChange={(e) => setAddOptionInputValue(e.target.value)} />
                                    <Button type="button" label="ADD" onClick={addOptionsInNewFields} />
                                  </div>
                                </div>
                                <ul className={styles.newFieldsOptionsBox}>
                                  {
                                    newFieldsOption.map((el, i) => {
                                      return <li key={"newfieldsArray" + i} className={styles.options}>{el} <Button type="button" icon="pi pi-times" className={"p-button-rounded p-button-danger " + styles.deleteOptionBtn} onClick={() => deleteNewFieldsOptionHandler(i)} /></li>
                                    })
                                  }
                                </ul>
                              </div>
                              : null
                          }

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
                          value.type === "application/vnd.ms-excel" || value.type === "text/csv"
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
                            <p className={styles.exclaWarning}><FaExclamationTriangle /> Please upload a CSV file to create your first Registry database.</p>
                            <div className="p-text-center">
                              <label
                                htmlFor="CSVFileUpload"
                                className="button">
                                <FiUpload />
                                Upload a CSV
                              </label>
                              <p className={styles.fileName}>{csvFileName(props.values)}</p>
                              <input id="CSVFileUpload" name="file" type="file" accept=".csv" onChange={(e) => csvFileUploadHandler(e, props.setFieldValue)} className={styles.CSVFileUpload} />

                              <ErrorMessage name="file">
                                {(msg) => <p className={styles.error}>{msg}</p>}
                              </ErrorMessage>
                              {
                                noCsvError ? <p className={styles.error}>Please upload an CSV to upload data into the registry</p> : ""
                              }
                            </div>
                            <div className="p-d-flex p-ai-center p-mt-4">
                              <div className="p-m-auto">
                                {/* <button type='button' onClick={() => { setDeleteColumnName(null); setDeleteFromDatabase(false); setNoDataModal(false) }} className={layoutStyles.customBluebtn} >Cancel</button> */}
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
      </DashboardLayout >
    </>
  )
}

export default withProtectSync(Dashboard)

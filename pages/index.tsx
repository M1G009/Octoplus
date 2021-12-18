import { useState, useEffect } from 'react';
import type { NextPage } from 'next'
import Router from 'next/router'
import { removeCookies } from 'cookies-next';
import { Menubar } from 'primereact/menubar';
import { Paginator } from 'primereact/paginator';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Modal from 'react-modal';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';


import { withProtectSync } from "../utils/protect"
import DashboardLayout from '../components/DashboardLayout';

import layoutStyles from '../styles/Home.module.scss';
import styles from '../styles/registry.module.scss'
import moment from 'moment';


const Dashboard: NextPage = () => {
  const [createNewContactModal, setCreateNewContactModal] = useState(false);
  const [addNewFieldModal, setAddNewFieldModal] = useState(false);
  const [replaceDataModal, setReplaceDataModal] = useState(false);
  const [customFirst1, setCustomFirst1] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [customRows1, setCustomRows1] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageInputTooltip, setPageInputTooltip] = useState('Press \'Enter\' key to go to this page.');
  const [contactFields, setContactFields] = useState({
    "name": '',
    "surname": '',
    "dob": `${moment().format('YYYY-MM-DD')}`,
    "sex": 'male',
    "cob": `${moment().format('YYYY-MM-DD')}`,
    "mob": '',
    "dor": `${moment().format('YYYY-MM-DD')}`,
    "family": 0,
    "group": '',
    "address": '',
    "streetno": 0
  })
  const [contactDataUpdated, setContactDataUpdated] = useState(true);

  const [addNewFields, setAddNewFields] = useState({
    "name": '',
    "datatype": 'string'
  })

  const [replaceDataFields, setReplaceDataFields] = useState({
    "selectdata": '',
    "changeto": '',
    "replacedata": 'specificcolumn',
    "selectcolumn": 'string'
  })


  const logoutHandler = async () => {
    removeCookies("ValidUser")
    window.localStorage.removeItem("authToken")
    window.localStorage.removeItem("ValidUser")
    window.localStorage.removeItem('loginUserdata');
    Router.push('/auth');
    // await fetch(`${process.env.API_BASE_URL}/user/signout`)
    //   .then(res => res.json())
    //   .then(async res => {
    //     console.log(res);
    //     removeCookies("ValidUser")
    //     window.localStorage.removeItem("ValidUser")
    //     window.localStorage.removeItem('loginUserdata');
    //     return Router.push('/auth');
    //   }).catch(err => {
    //     console.log(err);
    //   })
  }

  const items = [
    {
      label: 'Replace Data',
      className: styles.menuItem,
      command: () => { setReplaceDataModal(true) }
    },
    {
      label: 'Export in PDF',
      className: `${styles.menuItem} ${styles.dropMenu}`,
      items: [
        {
          label: 'Export in CSV',
        }
      ]
    },
    {
      label: 'Create New Contact',
      className: `${styles.createNewBtn}`,
      command: () => { setCreateNewContactModal(true) }
    }
  ];

  const [contacts, setContacts] = useState([
    { name: "Francesco Perone", surname: 'Perone', dob: '12/09/1992', sex: 'Male', country: 'Italy', municipalty: 'Potenza', dor: '28/04/1998', family: '5532', par: 'MG', addr: 'Via Aldo Moro', street: '34' },
    { name: "Francesco Perone", surname: 'Perone', dob: '12/09/1992', sex: 'Male', country: 'Italy', municipalty: 'Potenza', dor: '28/04/1998', family: '5532', par: 'MG', addr: 'Via Aldo Moro', street: '34' },
    { name: "Francesco Perone", surname: 'Perone', dob: '12/09/1992', sex: 'Male', country: 'Italy', municipalty: 'Potenza', dor: '28/04/1998', family: '5532', par: 'MG', addr: 'Via Aldo Moro', street: '34' },
    { name: "Francesco Perone", surname: 'Perone', dob: '12/09/1992', sex: 'Male', country: 'Italy', municipalty: 'Potenza', dor: '28/04/1998', family: '5532', par: 'MG', addr: 'Via Aldo Moro', street: '34' },
    { name: "Francesco Perone", surname: 'Perone', dob: '12/09/1992', sex: 'Male', country: 'Italy', municipalty: 'Potenza', dor: '28/04/1998', family: '5532', par: 'MG', addr: 'Via Aldo Moro', street: '34' },
    { name: "Francesco Perone", surname: 'Perone', dob: '12/09/1992', sex: 'Male', country: 'Italy', municipalty: 'Potenza', dor: '28/04/1998', family: '5532', par: 'MG', addr: 'Via Aldo Moro', street: '34' }
  ]);

  const onCustomPageChange1 = (event: any) => {
    setCustomFirst1(event.first);
    setCustomRows1(event.rows);
    setCurrentPage(event.page + 1);
  }

  const onPageInputKeyDown = (event: any, options: any) => {
    if (event.key === 'Enter') {
      const page = currentPage;
      if (page <= 0 || page > options.totalPages) {
        setPageInputTooltip(`Value must be between 1 and ${options.totalPages}.`);
      }
      else {
        const first = currentPage ? options.rows * (page - 1) : 0;

        setCustomFirst1(first);
        setPageInputTooltip('Press \'Enter\' key to go to this page.');
      }
    }
  }

  const onPageInputChange = (event: any) => {
    setCurrentPage(event.target.value);
  }

  const template1 = ({
    layout: 'PrevPageLink PageLinks NextPageLink RowsPerPageDropdown CurrentPageReport',
    PrevPageLink: (options: any) => {
      return (
        <>
          <span className={styles.totalItemsText}>Total {totalRecords} items</span>
          <button type="button" className={options.className + ' ' + styles.leftArrowIc} onClick={options.onClick} disabled={options.disabled}>
            <FaChevronLeft />
          </button>
        </>
      )
    },
    NextPageLink: (options: any) => {
      return (
        <button type="button" className={options.className + ' ' + styles.rightArrowIc} onClick={options.onClick} disabled={options.disabled}>
          <FaChevronRight />
        </button>
      )
    },
    PageLinks: (options: any) => {
      // if ((options.view.startPage === options.page && options.view.startPage !== 0) || (options.view.endPage === options.page && options.page + 1 !== options.totalPages)) {
      //   const className = options.className + " p-disabled";

      //   return <span className={className} style={{ userSelect: 'none' }}>...</span>;
      // }
      if (options.page == options.currentPage) {
        return (
          <button type="button" className={options.className + ' ' + styles.curruntPageActive + ' ' + styles.pageNumbers} onClick={options.onClick}>
            {options.page + 1}
          </button>
        )
      }


      return (
        <button type="button" className={options.className + ' ' + styles.pageNumbers} onClick={options.onClick}>
          {options.page + 1}
        </button>
      )
    },
    RowsPerPageDropdown: (options: any) => {
      setTotalRecords(options.totalRecords);
      const dropdownOptions = [
        { label: "10 / page", value: 10 },
        { label: "20 / page", value: 20 },
        { label: "30 / page", value: 30 }
      ];

      return <Dropdown value={options.value} options={dropdownOptions} className={styles.pagePerDropdown} onChange={options.onChange} />;
    },
    CurrentPageReport: (options: any) => {

      return (
        <span className="p-mx-3" style={{ color: 'var(--text-color)', userSelect: 'none' }}>
          Go to <InputText size={2} className={"p-ml-1 py-0 px-1 " + styles.jumpInput} value={currentPage}
            onKeyDown={(e) => onPageInputKeyDown(e, options)} onChange={onPageInputChange} />
        </span>
      )
    }
  });

  const createNewContactCustomStyles = {
    overlay: {
      background: "#00000021",
      backdropFilter: "blur(7px)"
    },
    content: {
      top: '0px',
      left: 'auto',
      right: '0px',
      bottom: '0px',
      width: "550px",
      maxWidth: "100%"
    },
  };

  const addNewFieldModalCustomStyles = {
    overlay: {
      background: "#00000021",
      backdropFilter: "blur(7px)"
    },
    content: {
      "border": "1px solid rgb(204, 204, 204)",
      "background": "rgb(255, 255, 255)",
      "overflow": "auto",
      "borderRadius": "4px",
      "outline": "none",
      "width": "550px",
      "padding": "0px",
      "maxWidth": "100%",
      "top": "50%",
      "left": "50%",
      "bottom": "auto",
      "right": "auto",
      "transform": "translate(-50%, -50%)"
    }
  };

  const contactFieldHandler = (key: any, value: any) => {
    // console.log(key, value);
    setContactFields((prevState) => ({ ...prevState, [key]: value }));
  }

  const newContactSaveBtnHandler = () => {
    console.log(contactFields);
  }

  const addNewFieldHandler = (key: any, value: any) => {
    // console.log(key, value);
    setAddNewFields((prevState) => ({ ...prevState, [key]: value }));
  }

  const addFieldSaveBtnHandler = () => {
    console.log(addNewFields);
  }

  const replaceDataHandler = (key: any, value: any) => {
    // console.log(key, value);
    setReplaceDataFields((prevState) => ({ ...prevState, [key]: value }));
  }

  const replacedataSaveBtnHandler = () => {
    console.log(replaceDataFields);
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
              <button className={layoutStyles.blueBtn}>Table Settings</button>
              <button onClick={() => setAddNewFieldModal(true)} className={layoutStyles.blueBgBtn}>Add New Field</button>
            </div>
          </div>
          <div className={styles.contectTableBox}>
            <div>
              <table className={styles.contectTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Surname</th>
                    <th>Date of Birth</th>
                    <th>Sex</th>
                    <th>Country of Birth</th>
                    <th>Municipality of Birth</th>
                    <th>Date of Residence</th>
                    <th>Family</th>
                    <th>Par</th>
                    <th>Address</th>
                    <th>Street No.</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    contacts.map((el, i) => {
                      return <tr key={"contact" + i}>
                        <td>{el.name}</td>
                        <td>{el.surname}</td>
                        <td>{el.dob}</td>
                        <td>{el.sex}</td>
                        <td>{el.country}</td>
                        <td>{el.municipalty}</td>
                        <td>{el.dor}</td>
                        <td>{el.family}</td>
                        <td>{el.par}</td>
                        <td>{el.addr}</td>
                        <td>{el.street}</td>
                      </tr>
                    })
                  }
                </tbody>
              </table>
            </div>
            {/* <Paginator template={template1} first={customFirst1} rows={customRows1} totalRecords={120} onPageChange={onCustomPageChange1}></Paginator> */}

            {/* Create-Contact-Modal */}
            <Modal
              isOpen={createNewContactModal}
              style={createNewContactCustomStyles}
              contentLabel="Create New Contact Modal"
              ariaHideApp={false}
            >
              <div className={styles.createContactModal}>
                <h5>Create new contact</h5>
                <div className={styles.contactFields}>
                  <div className={styles.inputBox}>
                    <label htmlFor="name">Name</label>
                    <InputText value={contactFields.name} id="name" name="name" type="text" onChange={(e) => contactFieldHandler(e.target.name, e.target.value)} />
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="surname">Surname</label>
                    <InputText value={contactFields.surname} id="surname" name="surname" type="text" onChange={(e) => contactFieldHandler(e.target.name, e.target.value)} />
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="dob">Date of Birth</label>
                    <input value={contactFields.dob} type="date" id="dob" name="dob" onChange={(e) => contactFieldHandler(e.target.name, e.target.value)} />
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="sex">Sex</label>
                    <div className="p-d-flex p-ai-center p-mr-2">
                      <RadioButton className={styles.checkBoxes} inputId="male" name="sex" value="male" checked={contactFields.sex == "male"} onChange={(e) => contactFieldHandler(e.target.name, e.target.value)} />
                      <label htmlFor="male">Male</label>
                    </div>
                    <div className="p-d-flex p-ai-center p-mr-2">
                      <RadioButton className={styles.checkBoxes} inputId="female" name="sex" value="female" checked={contactFields.sex == "female"} onChange={(e) => contactFieldHandler(e.target.name, e.target.value)} />
                      <label htmlFor="female">Female</label>
                    </div>
                    <div className="p-d-flex p-ai-center p-mr-2">
                      <RadioButton className={styles.checkBoxes} inputId="unspecified" name="sex" value="Unspecified" checked={contactFields.sex == "Unspecified"} onChange={(e) => contactFieldHandler(e.target.name, e.target.value)} />
                      <label htmlFor="unspecified">Unspecified</label>
                    </div>
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="cob">Country of Birth</label>
                    <input value={contactFields.cob} type="date" id="cob" name="cob" onChange={(e) => contactFieldHandler(e.target.name, e.target.value)} />
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="mob">Municipality of Birth</label>
                    <InputText value={contactFields.mob} id="mob" name="mob" type="text" onChange={(e) => contactFieldHandler(e.target.name, e.target.value)} />
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="dor">Date of residence</label>
                    <input value={contactFields.dor} type="date" id="dor" name="dor" onChange={(e) => contactFieldHandler(e.target.name, e.target.value)} />
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="family">Family</label>
                    <InputNumber value={contactFields.family} name="family" id="family" className={styles.typeNumber} showButtons buttonLayout="stacked" min={1} onChange={(e) => contactFieldHandler("family", e.value)} />
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="group">Group</label>
                    <InputText value={contactFields.group} id="group" name="group" type="text" onChange={(e) => contactFieldHandler(e.target.name, e.target.value)} />
                  </div>
                  <div className={styles.inputBox + " align-items-start"}>
                    <label htmlFor="address">Address</label>
                    <InputTextarea value={contactFields.address} name="address" id="address" rows={3} onChange={(e) => contactFieldHandler(e.target.name, e.target.value)} />
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="streetno">Street No.</label>
                    <InputNumber value={contactFields.streetno} id="streetno" name="streetno" className={styles.typeNumber} onChange={(e) => contactFieldHandler("streetno", e.value)} showButtons buttonLayout="stacked" min={1} />
                  </div>
                </div>
                <div className="p-d-flex p-ai-center p-mt-4">
                  {
                    contactDataUpdated ? <button className={layoutStyles.customBluebtn}>See original details</button> : null
                  }
                  <div className="p-ml-auto">
                    <button onClick={newContactSaveBtnHandler} className={layoutStyles.customBlueBgbtn}>Save</button>
                    <button onClick={() => setCreateNewContactModal(false)} className={layoutStyles.customDarkBgbtn}>Cancel</button>
                  </div>
                </div>
              </div>
            </Modal>

            {/* Add New Field-Modal */}
            <Modal
              isOpen={addNewFieldModal}
              style={addNewFieldModalCustomStyles}
              contentLabel="Add New Field Modal"
              ariaHideApp={false}
            >
              <div className={styles.addNewFieldModal}>
                <h5>Add new field</h5>
                <div className={styles.inputFields}>
                  <div className={styles.inputBox}>
                    <label htmlFor="name">Enter field name for new column</label>
                    <InputText value={addNewFields.name} id="name" name="name" type="text" onChange={(e) => addNewFieldHandler(e.target.name, e.target.value)} />
                  </div>

                  <div className={styles.inputBox}>
                    <label htmlFor="dataType">Select the data type</label>
                    <select id="datatype" name="datatype" value={addNewFields.datatype} onChange={(e) => addNewFieldHandler(e.target.name, e.target.value)}>
                      <option selected={addNewFields.datatype == "string"} value="string">string</option>
                      <option selected={addNewFields.datatype == "boolean"} value="boolean">boolean</option>
                    </select>
                  </div>
                  <div className="p-d-flex p-ai-center p-mt-4">
                    <div className="p-m-auto">
                      <button onClick={addFieldSaveBtnHandler} className={layoutStyles.customBlueBgbtn}>Save</button>
                      <button onClick={() => setAddNewFieldModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>

            {/* Replace data-Modal */}
            <Modal
              isOpen={replaceDataModal}
              style={addNewFieldModalCustomStyles}
              contentLabel="Replace data Modal"
              ariaHideApp={false}
            >
              <div className={styles.replaceDataModal}>
                <h5>Add new field</h5>
                <div className={styles.inputFields}>
                  <div>
                    <div className={styles.inputBox}>
                      <label htmlFor="selectdata">Select data</label>
                      <InputText value={replaceDataFields.selectdata} id="selectdata" name="selectdata" type="text" onChange={(e) => replaceDataHandler(e.target.name, e.target.value)} />
                    </div>
                    <div className={styles.inputBox}>
                      <label htmlFor="changeto">Change to</label>
                      <InputText value={replaceDataFields.changeto} id="changeto" name="changeto" type="text" onChange={(e) => replaceDataHandler(e.target.name, e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.inputBox + ' ' + styles.radioBox}>
                    <div className="p-d-flex p-ai-center p-mr-2">
                      <RadioButton className={styles.checkBoxes} inputId="specificcolumn" name="replacedata" value="specificcolumn" checked={replaceDataFields.replacedata == "specificcolumn"} onChange={(e) => replaceDataHandler(e.target.name, e.target.value)} />
                      <label htmlFor="specificcolumn">Replace data on specific column</label>
                    </div>
                    <div className="p-d-flex p-ai-center">
                      <RadioButton className={styles.checkBoxes} inputId="wholeregistry" name="replacedata" value="wholeregistry" checked={replaceDataFields.replacedata == "wholeregistry"} onChange={(e) => replaceDataHandler(e.target.name, e.target.value)} />
                      <label htmlFor="wholeregistry">Replace data on whole registry</label>
                    </div>
                  </div>

                  <div className={styles.inputBox}>
                    <select id="datatype" name="datatype" value={replaceDataFields.selectcolumn} onChange={(e) => replaceDataHandler(e.target.name, e.target.value)}>
                      <option selected={replaceDataFields.selectcolumn == "string"} value="string">string</option>
                      <option selected={replaceDataFields.selectcolumn == "boolean"} value="boolean">boolean</option>
                    </select>
                  </div>
                  <div className="p-d-flex p-ai-center p-mt-4">
                    <div className="p-m-auto">
                      <button onClick={replacedataSaveBtnHandler} className={layoutStyles.customBlueBgbtn}>Save</button>
                      <button onClick={() => setReplaceDataModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>

    </DashboardLayout>
  )
}

export default withProtectSync(Dashboard)

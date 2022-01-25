// React Module Imports
import { useEffect, useState } from 'react';

// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router';

// Prime React Imports
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { Checkbox } from 'primereact/checkbox';

// 3rd Party Imports
import * as yup from 'yup';
import { ErrorMessage, Formik, Field, FormikHelpers } from 'formik';
import { RiDownload2Line } from "react-icons/ri";
import valid from "card-validator";
import { FaCcVisa, FaCcMastercard, FaCcDinersClub, FaCcJcb, FaCcDiscover, FaCcAmex, FaCreditCard } from "react-icons/fa";
import { ToastContainer } from "react-toastify";

// Style and Component Imports
import toast from "../../components/Toast";
import {
  formatCreditCard,
  dateCheck,
  cvvCheck
} from "../../components/helper/helperFunctions";
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';
import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/profile.module.scss';

// Interface/Helper Imports
import service from '../../helper/api/api';




export interface CardFields {
  Card_name: string;
  card_number: string;
  cvv: string;
  expire_date: string;
  is_primary: string;
}

export interface GetCardDetails {
  _id: string;
  Card_name: string;
  card_number: string;
  cvv: string;
  expire_date: string;
  card_type: string;
  user_id: string;
  created_date: string;
  is_primary: string
}

const Billing: NextPage = () => {
  const router = useRouter();
  const [formSpinner, setFormSpinner] = useState(false);
  const [addCardModal, setAddCardModal] = useState(false);
  const [selectMonth, setSelectMonth] = useState(null);
  const [cardType, setCardType] = useState('');
  const [editId, setEditId] = useState('');
  const [cardFields, setCardFields] = useState<CardFields>()
  const [getCardDetails, setGetCardDetails] = useState<GetCardDetails[]>([])
  const [invoiceDate, setInvoiceDate] = useState<Date | Date[] | undefined>(new Date());


  const monthsOptions = [
    { name: 'January' },
    { name: 'February' },
    { name: 'March' },
    { name: 'April' },
    { name: 'May' },
    { name: 'June' },
    { name: 'July' },
    { name: 'August' },
    { name: 'September' },
    { name: 'October' },
    { name: 'November' },
    { name: 'December' }
  ];

  const fatchingCards = async () => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }
      const { data } = await service({
        url: `${process.env.API_BASE_URL}/card_detail`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });

      return setGetCardDetails(data.data)
    } catch (err) {
      return toast({ type: "error", message: err });
    }
  }

  useEffect(() => {
    async function fetchGetUserAPI() {
      await fatchingCards();
    }
    fetchGetUserAPI();
  }, [])

  const validationSchema = yup.object().shape({
    Card_name: yup.string().required('Please enter card owner name'),
    card_number: yup.string().required('Please enter card number').test({ message: 'Please enter correct card number', test: (value) => valid.number(value).isValid }),
    expire_date: yup.string().required('Please enter expiry date').test({
      message: 'Please enter correct expiry date',
      test: (value) => valid.expirationDate(value).isValid
    }),
    cvv: yup.string().required('Please enter correct cvv').min(3).max(4)
  });

  const onMonthChange = (e: { value: any }) => {
    setSelectMonth(e.value);
  }

  const addCardFieldHandler = (key: any, value: any, setFieldValue: any) => {
    let userValue: any;

    if (key == "Card_name") {
      userValue = value;
    } else if (key == "card_number") {
      userValue = formatCreditCard(value);
      let cardDetails = valid.number(parseInt(value.replace(/ /g, ''))).card;
      if (cardDetails) {
        setCardType(cardDetails.type)
      } else {
        setCardType('')
      }
    } else if (key == "expire_date") {
      userValue = dateCheck(value);
    } else if (key == "cvv") {
      userValue = cvvCheck(value);
    }

    setFieldValue(key, userValue)
  }

  const saveCardHandler = async (getData: any) => {
    try {
      let userData = JSON.parse(getData);
      let authToken = await window.localStorage.getItem('authToken');
      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }
      let newCardObj = { ...userData, ['card_number']: userData.card_number.replace(/ /g, '') }

      if (editId) {
        let updateCardObj = { ...newCardObj, ['card_id']: editId }
        setFormSpinner(true);
        const { data } = await service({
          url: `${process.env.API_BASE_URL}/card_update`,
          method: 'POST',
          data: JSON.stringify(updateCardObj),
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
        });
        setFormSpinner(false);
        if (data.status != 200) {
          return await toast({ type: "error", message: data.message });
        }
        await fatchingCards();
        setEditId('')
        return setAddCardModal(false)

      } else {
        setFormSpinner(true);
        const { data } = await service({
          url: `${process.env.API_BASE_URL}/card_insert`,
          method: 'POST',
          data: JSON.stringify(newCardObj),
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
        });
        setFormSpinner(false);
        if (data.status != 200) {
          return await toast({ type: "error", message: data.message });
        }
        await fatchingCards();

        return await setAddCardModal(false)
      }

    } catch (err) {
      setFormSpinner(false);
      return await toast({ type: "error", message: err });
    }
  }

  const cardNumberHandler = (num: string) => {
    var lastFive = num.slice(num.length - 4);
    return "**** " + lastFive;
  }

  const cardTypeIconHandler = (num: string) => {
    let cardDetails = valid.number(parseInt(num.replace(/ /g, ''))).card;
    if (cardDetails) {
      let type = cardDetails.type
      if (type == 'mastercard') {
        return <FaCcMastercard />
      } else if (type == 'visa') {
        return <FaCcVisa />
      } else if (type == 'diners-club') {
        return <FaCcDinersClub />
      } else if (type == 'jcb') {
        return <FaCcJcb />
      } else if (type == 'discover') {
        return <FaCcDiscover />
      } else if (type == 'american-express') {
        return <FaCcAmex />
      } else {
        return <FaCreditCard />
      }
    }
  }

  const deleteCardHandler = async (id: any) => {
    try {
      let authToken = await window.localStorage.getItem('authToken');
      let deleteIdObj = { card_id: id }
      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      const { data } = await service({
        url: `${process.env.API_BASE_URL}/card_delete`,
        method: 'POST',
        data: JSON.stringify(deleteIdObj),
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });

      if (data.status != 200) {
        return await toast({ type: "error", message: data.message });
      }

      return await fatchingCards();
    } catch (err) {
      return toast({ type: "error", message: err });
    }
  }

  const deleteConfirm = (id: any) => {
    confirmDialog({
      message: 'Are you sure you want to delete this card ?',
      header: 'Delete Card',
      icon: 'pi pi-info-circle',
      acceptClassName: layoutStyles.customRedBgbtn,
      accept: () => deleteCardHandler(id)
    });
  }

  const editCardHandler = (id: string) => {
    let editCardDetails = getCardDetails.find(el => el._id === id);
    if (editCardDetails) {
      let createEditCard = { Card_name: editCardDetails.Card_name, card_number: formatCreditCard(editCardDetails.card_number), cvv: editCardDetails.cvv, expire_date: editCardDetails.expire_date, is_primary: editCardDetails.is_primary }
      setCardFields(createEditCard);
      setEditId(id);
      setAddCardModal(true)
    }
  }

  const cancelAddCardHandler = () => {
    setEditId('');
    setCardFields({
      Card_name: '',
      card_number: '',
      cvv: '',
      expire_date: '',
      is_primary: ''
    })
    setAddCardModal(false);
  }

  const addPaymentMethodHandler = () => {
    setAddCardModal(true);
    setEditId('');
    setCardFields({
      Card_name: '',
      card_number: '',
      cvv: '',
      expire_date: '',
      is_primary: ''
    })
  }

  return (
    <DashboardLayout sidebar={true}>
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
        <p>Home / Proflie / <span>Billing</span></p>
        <h5>Billing Information</h5>
      </div>
      <div className={layoutStyles.box}>
        <div className={layoutStyles.headContentBox + " p-mb-5"}>
          <div className={layoutStyles.head}>
            <h4>Payment Method</h4>
            <div className={layoutStyles.editButtons}>
              <button onClick={addPaymentMethodHandler} className={layoutStyles.blueBgBtn + " p-m-0"}>Add Payment Method</button>
            </div>
          </div>
          <div className={layoutStyles.textBox}>
            <div className={styles.paymentMethod}>
              {
                getCardDetails.length ?
                  getCardDetails.map((card, i) => {
                    return <div className={styles.methodCard} key={card._id}>
                      <label htmlFor="">{card.Card_name} {card.is_primary == "Y" ? <span>Primary</span> : null}</label>
                      <div className={styles.cardDetails}>
                        <div className={styles.imgBox}>
                          <div className={styles.cardType}>
                            {cardTypeIconHandler(card.card_number)}
                          </div>
                          <div className={styles.textBox}>
                            <h5>{card.card_type} {cardNumberHandler(card.card_number)}</h5>
                            <p>Card expires at {card.expire_date}</p>
                          </div>
                        </div>
                        <div className={styles.btnGroup}>
                          {
                            card.is_primary != "Y" ? <button onClick={() => deleteConfirm(card._id)} className={styles.deleteBtn}>Delete</button> : ''
                          }
                          <button onClick={() => editCardHandler(card._id)} className={styles.editBtn}>Edit</button>
                        </div>
                      </div>
                    </div>
                  })
                  :
                  <p className='p-m-0'>No card details found</p>
              }
            </div>
          </div>
        </div>
        <div className={layoutStyles.headContentBox + " p-mb-5"}>
          <div className={layoutStyles.head}>
            <h4>Subcription Plan</h4>
          </div>
          <div className={layoutStyles.textBox + " " + styles.subPlan}>
            <div className="p-d-flex p-ai-center p-jc-between">
              <h5 className="p-m-0">Basic Plan</h5>
              <div>
                <button className={layoutStyles.customBlueBgbtn}>Upgrade Plan</button>
                <button className={layoutStyles.customBluebtn}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
        <div className={layoutStyles.headContentBox}>
          <div className={layoutStyles.head}>
            <h4>Invoice</h4>
          </div>
          <div className={layoutStyles.textBox + " p-d-flex p-jc-between"}>
            <div className={styles.invoiceBox}>
              <label htmlFor="DownloadInvoice">Download Invoice</label>
              <Calendar id="monthpicker" value={invoiceDate} onChange={(e) => setInvoiceDate(e.value)} view="month" dateFormat="mm/yy" yearNavigator yearRange="2010:2030" />
            </div>
            <button className={styles.downloadBtn}><RiDownload2Line />Download PDF</button>
          </div>
        </div>
      </div>

      {/* Payment Card */}
      <Dialog showHeader={false} contentClassName={styles.addCardModal} visible={addCardModal} style={{ width: '500px', }} onHide={() => ''}>
        <div className={styles.addCardModal}>
          <h5>
            {
              editId ? "Update Card" : "Add Card"
            }
          </h5>
          <Formik
            enableReinitialize
            initialValues={{
              Card_name: cardFields ? cardFields.Card_name : 'asdas',
              card_number: cardFields ? cardFields.card_number : '',
              cvv: cardFields ? cardFields.cvv : '',
              expire_date: cardFields ? cardFields.expire_date : '',
              is_primary: cardFields ? cardFields.is_primary : 'N'
            }}
            validationSchema={validationSchema}
            onSubmit={(
              values: CardFields,
              { setSubmitting }: FormikHelpers<CardFields>
            ) => {
              saveCardHandler(JSON.stringify(values, null, 2));
              setSubmitting(false);
            }}
          >
            {props => (
              <form onSubmit={props.handleSubmit}>
                {
                  formSpinner ? <div className={styles.formSpinner}>
                    <div className={styles.loading}></div>
                  </div> : null
                }
                <div className={styles.inputFields}>
                  <div className={styles.inputBox}>
                    <label htmlFor="inviteEmail">Card Number</label>
                    <div>
                      <Field type="text" name="card_number" onChange={(e: any) => addCardFieldHandler('card_number', e.target.value, props.setFieldValue)} />
                      <ErrorMessage name="card_number">
                        {(msg) => <p className={styles.error}>{msg}</p>}
                      </ErrorMessage>
                    </div>
                    {
                      cardType ?
                        (
                          cardType == 'mastercard' ? <FaCcMastercard /> : (cardType == 'visa' ? <FaCcVisa /> : (cardType == 'diners-club' ? <FaCcDinersClub /> : (cardType == 'jcb' ? <FaCcJcb /> : (cardType == 'discover' ? <FaCcDiscover /> : (cardType == 'american-express' ? <FaCcAmex /> : null)))))
                        )
                        :
                        null
                    }
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="inviteName">Card holder name</label>
                    <div>
                      <Field type="text" name="Card_name" onChange={(e: any) => addCardFieldHandler('Card_name', e.target.value, props.setFieldValue)} />
                      <ErrorMessage name="Card_name">
                        {(msg) => <p className={styles.error}>{msg}</p>}
                      </ErrorMessage>
                    </div>
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="expire_date">Expire Date</label>
                    <div>
                      <Field type="text" name="expire_date" onChange={(e: any) => addCardFieldHandler('expire_date', e.target.value, props.setFieldValue)} />
                      <ErrorMessage name="expire_date">
                        {(msg) => <p className={styles.error}>{msg}</p>}
                      </ErrorMessage>
                    </div>
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="cvv">CVV</label>
                    <div>
                      <Field type="text" name="cvv" onChange={(e: any) => addCardFieldHandler('cvv', e.target.value, props.setFieldValue)} />
                      <ErrorMessage name="cvv">
                        {(msg) => <p className={styles.error}>{msg}</p>}
                      </ErrorMessage>
                    </div>
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="is_primary">Make Primary</label>
                    <div>
                      <Checkbox inputId="is_primary" name="is_primary" checked={props.values.is_primary == "Y"} onChange={(e) => props.setFieldValue('is_primary', e.target.checked ? "Y" : "N")} />
                    </div>
                  </div>
                  <div className="p-d-flex p-ai-center p-mt-3">
                    <div className="p-m-auto">
                      <button type="submit" className={layoutStyles.customBlueBgbtn}>
                        {
                          editId ? "Update Card" : "Add Card"
                        }
                      </button>
                      <button type="button" onClick={cancelAddCardHandler} className={layoutStyles.customBluebtn}>Cancel</button>
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

export default withProtectSync(Billing)
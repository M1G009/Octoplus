import type { NextPage } from 'next'
import { SiVisa, SiMastercard } from "react-icons/si";
import Router from 'next/router';
import { RiDownload2Line } from "react-icons/ri";
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { InputText } from 'primereact/inputtext';
import valid from "card-validator";
import { FaCcVisa, FaCcMastercard, FaCcDinersClub, FaCcJcb, FaCcDiscover, FaCcAmex, FaCreditCard } from "react-icons/fa";
import { ToastContainer } from "react-toastify";

import toast from "../../components/Toast";

import {
  validateInputs,
  formatCreditCard,
  dateCheck,
  cvvCheck
} from "../../components/helper/helperFunctions";
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';

import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/profile.module.scss';


export interface CardFields {
  Card_name: string;
  card_number: string;
  cvv: string;
  expire_date: string;
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
}

const Billing: NextPage = () => {
  const [addCardModal, setAddCardModal] = useState(false);
  const [selectMonth, setSelectMonth] = useState(null);
  const [cardType, setCardType] = useState('');
  const [editId, setEditId] = useState('');
  const [cardFields, setCardFields] = useState<CardFields>({
    Card_name: '',
    card_number: '',
    cvv: '',
    expire_date: ''
  })
  const [getCardDetails, setGetCardDetails] = useState<GetCardDetails[]>([])

  const cities = [
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

  const addCardModalCustomStyles = {
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

  const fatchingCards = async () => {
    let authToken = await window.localStorage.getItem('authToken');

    if (!authToken) {
      window.localStorage.removeItem("authToken")
      window.localStorage.removeItem("ValidUser")
      window.localStorage.removeItem('loginUserdata');
      return Router.push('/auth');
    }
    await fetch(`${process.env.API_BASE_URL}/card_detail`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
    })
      .then(res => res.json())
      .then(async res => {
        if (res.status != 200) {
          return await toast({ type: "error", message: res.message });
        }
        setGetCardDetails(res.data)
      }).catch(err => {
        toast({ type: "error", message: err });
      })
  }

  useEffect(() => {
    async function fetchGetUserAPI() {
      await fatchingCards();
    }

    fetchGetUserAPI()
  }, [])

  const onMonthChange = (e: { value: any }) => {
    setSelectMonth(e.value);
  }

  const addCardFieldHandler = (key: any, value: any) => {
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

    setCardFields(prevState => ({ ...prevState, [key]: userValue }))
  }

  const saveCardHandler = async () => {
    if (!validateInputs(cardFields.Card_name, cardFields.card_number, cardFields.expire_date, cardFields.cvv)) {
      return await toast({ type: "error", message: "Please enter valid value" });
    }

    let authToken = await window.localStorage.getItem('authToken');
    if (!authToken) {
      window.localStorage.removeItem("authToken")
      window.localStorage.removeItem("ValidUser")
      window.localStorage.removeItem('loginUserdata');
      return Router.push('/auth');
    }
    let newCardObj = { ...cardFields, ['card_number']: cardFields.card_number.replace(/ /g, '') }

    if (editId) {
      let updateCardObj = { ...newCardObj, ['card_id']: editId }
      await fetch(`${process.env.API_BASE_URL}/card_update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
        body: JSON.stringify(updateCardObj)
      })
        .then(res => res.json())
        .then(async res => {
          if (res.status != 200) {
            return await toast({ type: "error", message: res.message });
          }
          await fatchingCards();
          setCardFields({
            Card_name: '',
            card_number: '',
            cvv: '',
            expire_date: ''
          })
          setEditId('')
          setAddCardModal(false)
          return await toast({ type: "success", message: "Card update successful" });
        }).catch(err => {
          toast({ type: "error", message: err });
        })
    } else {
      await fetch(`${process.env.API_BASE_URL}/card_insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
        body: JSON.stringify(newCardObj)
      })
        .then(res => res.json())
        .then(async res => {
          if (res.status != 200) {
            return await toast({ type: "error", message: res.message });
          }
          await fatchingCards();
          setCardFields({
            Card_name: '',
            card_number: '',
            cvv: '',
            expire_date: ''
          })
          setAddCardModal(false)
          return await toast({ type: "success", message: "Card insert successful" });
        }).catch(err => {
          toast({ type: "error", message: err });
        })
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
    let authToken = await window.localStorage.getItem('authToken');
    let deleteIdObj = { card_id: id }
    if (!authToken) {
      window.localStorage.removeItem("authToken")
      window.localStorage.removeItem("ValidUser")
      window.localStorage.removeItem('loginUserdata');
      return Router.push('/auth');
    }

    await fetch(`${process.env.API_BASE_URL}/card_delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
      body: JSON.stringify(deleteIdObj)
    })
      .then(res => res.json())
      .then(async res => {
        if (res.status != 200) {
          return await toast({ type: "error", message: res.message });
        }
        await fatchingCards();
        return await toast({ type: "success", message: "Card delete successful" });
      }).catch(err => {
        toast({ type: "error", message: err });
      })
  }

  const editCardHandler = (id: string) => {
    let editCardDetails = getCardDetails.find(el => el._id === id);
    // console.log(editCardDetails);
    if (editCardDetails) {
      let createEditCard = { Card_name: editCardDetails.Card_name, card_number: formatCreditCard(editCardDetails.card_number), cvv: editCardDetails.cvv, expire_date: editCardDetails.expire_date }
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
      expire_date: ''
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
      expire_date: ''
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
                getCardDetails.map((card, i) => {
                  return <div className={styles.methodCard} key={card._id}>
                    <label htmlFor="">{card.Card_name} {i == 0 ? <span>Primary</span> : null}</label>
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
                        <button onClick={() => deleteCardHandler(card._id)} className={styles.deleteBtn}>Delete</button>
                        <button onClick={() => editCardHandler(card._id)} className={styles.editBtn}>Edit</button>
                      </div>
                    </div>
                  </div>
                })
              }
            </div>
          </div>
        </div>
        <div className={layoutStyles.headContentBox + " p-mb-5"}>
          <div className={layoutStyles.head}>
            <h4>Subcription Plan</h4>
          </div>
          <div className={layoutStyles.textBox}>
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
              <Dropdown inputId="DownloadInvoice" value={selectMonth} options={cities} onChange={onMonthChange} className={styles.selectBox} placeholder="Select" optionLabel="name" />
            </div>
            <button className={styles.downloadBtn}><RiDownload2Line />Download PDF</button>
          </div>
        </div>
      </div>

      {/* Payment Card */}
      <Modal
        isOpen={addCardModal}
        style={addCardModalCustomStyles}
        contentLabel="Add New Field Modal"
        ariaHideApp={false}
      >
        <div className={styles.addCardModal}>
          <h5>
            {
              editId ? "Update Card" : "Add Card"
            }
          </h5>
          <div className={styles.inputFields}>
            <div className={styles.inputBox}>
              <label htmlFor="inviteEmail">Card Number</label>
              <InputText id="inviteEmail" name="card_number" type="text" value={cardFields.card_number} onChange={(e) => addCardFieldHandler("card_number", e.target.value)} placeholder='•••• •••• •••• ••••' />
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
              <label htmlFor="inviteName">Card Name</label>
              <InputText id="inviteName" name="Card_name" type="text" value={cardFields.Card_name} onChange={(e) => addCardFieldHandler("Card_name", e.target.value)} placeholder='Enter your name' />
            </div>
            <div className={styles.inputBox}>
              <label htmlFor="expire_date">Expire Date</label>
              <InputText id="expire_date" name="expire_date" type="text" value={cardFields.expire_date} onChange={(e) => addCardFieldHandler("expire_date", e.target.value)} placeholder='01/23' />
            </div>
            <div className={styles.inputBox}>
              <label htmlFor="cvv">CVV</label>
              <InputText id="cvv" name="cvv" type="text" value={cardFields.cvv} onChange={(e) => addCardFieldHandler("cvv", e.target.value)} placeholder='123' />
            </div>
            <div className="p-d-flex p-ai-center p-mt-4">
              <div className="p-m-auto">
                <button onClick={saveCardHandler} className={layoutStyles.customBlueBgbtn}>
                  {
                    editId ? "Update Card" : "Add Card"
                  }
                  </button>
                <button onClick={cancelAddCardHandler} className={layoutStyles.customBluebtn}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default withProtectSync(Billing)
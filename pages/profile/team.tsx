import { useEffect, useState } from 'react';
import Router from 'next/router';
import type { NextPage } from 'next'
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { BsCheck2Square, BsSquare } from "react-icons/bs";
import Modal from 'react-modal';
import { ToastContainer } from "react-toastify";

import toast from "../../components/Toast";
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';

import layoutStyles from '../../styles/Home.module.scss';


import styles from '../../styles/profile.module.scss';


export interface Access {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface IAddScopeData {
  name: string;
  slug: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface Scope {
  name: string;
  slug: string;
  access: Access;
}

export interface ICreateRoleScopeData {
  name: string;
  scopes: Scope[];
}

export interface TeamMember {
  username: string;
  email: string;
  user_id: string;
  role_name: string;
}

export interface RoleNames {
  label: string;
  value: string;
  id: string;
}

export interface RoleData {
  _id: string;
  role: ICreateRoleScopeData;
}

const Team: NextPage = (props: any) => {
  // States starts
  const [createRole, setCreateRole] = useState(false);
  const [invitePeopleModal, setInvitePeopleModal] = useState(false);
  const [createRoleName, setCreateRoleName] = useState('');
  const [selectRoleName, setSelectRoleName] = useState({ label: '', id: '' });
  const [saveRoleBtn, setSaveRoleBtn] = useState(false);
  const [createRoleScopeData, setCreateRoleScopeData] = useState<ICreateRoleScopeData>(
    {
      name: "",
      scopes: []
    }
  );
  const [addScopeData, setAddScopeData] = useState<Scope>(
    {
      name: "",
      slug: "",
      access: {
        create: true,
        read: true,
        update: true,
        delete: true
      }
    }
  );
  const [inviteFields, setInviteFields] = useState({
    name: '',
    email: '',
    role: ''
  })
  const [editScopeIndex, setEditScopeIndex] = useState(-1);
  const [roleNames, setRoleNames] = useState<RoleNames[]>([]);
  const [roleData, setRoleData] = useState<RoleData[]>();
  const [teamMember, setTeamMember] = useState<TeamMember[]>([])

  // States Ends
  const fetchAllRoles = async () => {
    let authToken = await window.localStorage.getItem('authToken');

    if (!authToken) {
      window.localStorage.removeItem("authToken")
      window.localStorage.removeItem("ValidUser")
      window.localStorage.removeItem('loginUserdata');
      return Router.push('/auth');
    }
    await fetch(`${process.env.API_BASE_URL}/getroles`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
    })
      .then(res => res.json())
      .then(async res => {
        if (res.status != 200) {
          return await toast({ type: "error", message: res.message });
        }
        setRoleData(res.data.roles);
        let roleArray: any[] = []
        res.data.role_list.map((li: any) => roleArray.push({ label: li.Label, value: li.Label, id: li._id }))
        setRoleNames(roleArray);
      }).catch(err => {
        toast({ type: "error", message: err });
      })
  }

  const getTeamMembers = async () => {
    let authToken = await window.localStorage.getItem('authToken');

    if (!authToken) {
      window.localStorage.removeItem("authToken")
      window.localStorage.removeItem("ValidUser")
      window.localStorage.removeItem('loginUserdata');
      return Router.push('/auth');
    }
    await fetch(`${process.env.API_BASE_URL}/getusers`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
    })
      .then(res => res.json())
      .then(async res => {
        if (res.status != 200) {
          return await toast({ type: "error", message: res.message });
        }
        setTeamMember(res.data);
      }).catch(err => {
        toast({ type: "error", message: err });
      })
  }

  // Handlers Start
  useEffect(() => {
    async function fetchGetUserAPI() {

      await getTeamMembers();
      await fetchAllRoles();
    }

    fetchGetUserAPI()
  }, [])

  const addScopeFieldsHandler = (key: any, value: any, access: boolean) => {
    if (access) {
      let copiedAccess = Object.assign({ ...addScopeData.access }, { [key]: value });
      return setAddScopeData(prevState => ({ ...prevState, ['access']: copiedAccess }));
    }
    setAddScopeData(prevState => ({ ...prevState, [key]: value }));
  }
  const addScopeHandler = () => {
    let newScope = { ...addScopeData };
    const isEmpty = Object.values(addScopeData).some(el => el === '');
    if (!isEmpty) {
      let scopeOfRoleArray = createRoleScopeData.scopes.slice();
      if (editScopeIndex >= 0) {
        const foundName = scopeOfRoleArray.some((el, i) => {
          if (i != editScopeIndex) {
            return el.name.toLowerCase() == newScope.name.toLowerCase()
          }
        });
        const foundSlug = scopeOfRoleArray.some((el, i) => {
          if (i != editScopeIndex) {
            return el.slug.toLowerCase() == newScope.slug.toLowerCase()
          }
        });
        if (foundName || foundSlug) {
          return toast({ type: "error", message: "Scope name or slug is already exist" });
        }
        scopeOfRoleArray[editScopeIndex] = newScope;
        const editRole = { ...createRoleScopeData, ['scopes']: scopeOfRoleArray };
        setCreateRoleScopeData(editRole);
        setEditScopeIndex(-1);
        setAddScopeData({
          name: "",
          slug: "",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true
          }
        })
      } else {
        const foundName = scopeOfRoleArray.some(el => el.name.toLowerCase() == newScope.name.toLowerCase());
        const foundSlug = scopeOfRoleArray.some(el => el.slug.toLowerCase() == newScope.slug.toLowerCase());
        if (foundName || foundSlug) {
          return toast({ type: "error", message: "Scope name or slug is already exist" });
        }
        scopeOfRoleArray.push(newScope);
        const newRole = { ...createRoleScopeData, ['scopes']: scopeOfRoleArray };
        setCreateRoleScopeData(newRole);
        setAddScopeData({
          name: "",
          slug: "",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true
          }
        })
      }
    }
  }
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
  const inviteFieldsHandler = (key: any, value: any) => {
    setInviteFields(prevState => ({ ...prevState, [key]: value }))
  }
  const editScopeHandler = (index: number) => {
    setEditScopeIndex(index);
    let scopeOfRoleArray = createRoleScopeData.scopes.slice();
    setAddScopeData(scopeOfRoleArray[index]);
  }
  const deleteScopeHandler = (index: number) => {
    let scopeOfRoleArray = createRoleScopeData.scopes.slice();
    scopeOfRoleArray.splice(index, 1);
    const editRole = { ...createRoleScopeData, ['scopes']: scopeOfRoleArray };
    setCreateRoleScopeData(editRole);
    toast({ type: "success", message: "Delete Role Successful" });
  }
  const saveRoleHandler = async () => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return Router.push('/auth');
      }

      // if => Update exist role
      // else => Create role
      if (selectRoleName.label && selectRoleName.id) {
        let editRoleObj = { role_id: selectRoleName.id, role: createRoleScopeData }
        setSaveRoleBtn(true);
        fetch(`${process.env.API_BASE_URL}/editrole`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
          body: JSON.stringify(editRoleObj),
        })
          .then(res => res.json())
          .then(async res => {
            if (res.status != 200) {
              return await toast({ type: "error", message: res.message });
            }
            toast({ type: "success", message: "Update role successful" });
            setSaveRoleBtn(false);
          }).catch(err => {
            toast({ type: "error", message: err });
            setSaveRoleBtn(false);
          })

        // Fetch all roles with currently updated role
        await fetchAllRoles()

      } else {
        let scopeOfRoleArray = createRoleScopeData.scopes.slice();
        if (!createRoleName) {
          return toast({ type: "error", message: "Please enter valid role name" });
        } else if (!scopeOfRoleArray.length) {
          return toast({ type: "error", message: "Please add atleast one scope" });
        } else if (scopeOfRoleArray.length && createRoleName) {
          const newRole = { ...createRoleScopeData, ['name']: createRoleName };
          let createRoleObj = { role: {} }
          createRoleObj = { ...createRoleObj, ['role']: newRole }
          setSaveRoleBtn(true);
          fetch(`${process.env.API_BASE_URL}/createrole`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
            body: JSON.stringify(createRoleObj),
          })
            .then(res => res.json())
            .then(async res => {
              if (res.status != 200) {
                return await toast({ type: "error", message: res.message });
              }
              toast({ type: "success", message: "Create new role successful" });
              setSaveRoleBtn(false);
            }).catch(err => {
              toast({ type: "error", message: err });
              setSaveRoleBtn(false);
            })
          setCreateRoleScopeData({
            name: "",
            scopes: []
          })
          setCreateRoleName('');
          setSelectRoleName({ label: '', id: '' })
          await fetchAllRoles()
        }
      }
    } catch (err) {

    }
  }
  const discardRoleHandler = () => {
    setCreateRoleScopeData({
      name: "",
      scopes: []
    })
    setCreateRoleName('');
    setSelectRoleName({ label: '', id: '' })
    setSaveRoleBtn(false);
    setCreateRole(false);
  }

  const selectEditRoleHandler = async (e: any) => {
    setCreateRoleName('');
    if (roleData) {
      let curruntObj = Object.assign({}, roleData[e.value]);
      setSelectRoleName({ label: e.value, id: curruntObj._id });
      setCreateRoleScopeData(curruntObj.role)
    }
  }

  const createNewDataInputHandler = (e: any) => {
    setCreateRoleName(e.target.value);
    setSelectRoleName({ label: '', id: '' });
    setCreateRoleScopeData({
      name: "",
      scopes: []
    })
  }

  const deleteRoleHandler = async () => {
    if (selectRoleName.label && selectRoleName.id) {
      let deleteRole = { role_id: selectRoleName.id }

      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return Router.push('/auth');
      }
      await fetch(`${process.env.API_BASE_URL}/deleterole`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
        body: JSON.stringify(deleteRole),
      })
        .then(res => res.json())
        .then(async res => {
          toast({ type: "success", message: "Delete role successful" });
          setCreateRoleScopeData({
            name: "",
            scopes: []
          })
          setCreateRoleName('');
          setSelectRoleName({ label: '', id: '' })
        }).catch(err => {
          toast({ type: "error", message: err });
        })

      await fetchAllRoles()
    }
  }

  const sendInviteHandler = async () => {
    if (!inviteFields.name || !inviteFields.email || !inviteFields.role) {
      return toast({ type: "error", message: "Please enter valid field value" });
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(inviteFields.email)) {
      return toast({ type: "error", message: "Invalid email address" });
    }

    let authToken = await window.localStorage.getItem('authToken');

    if (!authToken) {
      window.localStorage.removeItem("authToken")
      window.localStorage.removeItem("ValidUser")
      window.localStorage.removeItem('loginUserdata');
      return Router.push('/auth');
    }

    await fetch(`${process.env.API_BASE_URL}/invite_send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
      body: JSON.stringify(inviteFields),
    })
      .then(res => res.json())
      .then(async res => {
        toast({ type: "success", message: "Invite send successful" });
        setInviteFields({
          name: '',
          email: '',
          role: ''
        })
        setInvitePeopleModal(false)
      }).catch(err => {
        toast({ type: "error", message: err });
      })

  }

  const memberRoleUpdateHandler = async (id: any, value: any) => {
    if (roleData) {
      let createUpdateRoleObj = { _id: id, role: roleData[value].role }
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return Router.push('/auth');
      }

      await fetch(`${process.env.API_BASE_URL}/roleupdate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
        body: JSON.stringify(createUpdateRoleObj),
      })
        .then(res => res.json())
        .then(async res => {
          toast({ type: "success", message: "Role update successful" });
          await getTeamMembers();
          await fetchAllRoles();
        }).catch(err => {
          toast({ type: "error", message: err });
        })
    }
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
        <p>Home / Proflie / <span>Team</span></p>
        <h5>Manage Team</h5>
      </div>
      <div className={layoutStyles.box}>
        {
          !createRole ?
            <div className={layoutStyles.headContentBox}>
              <div className={layoutStyles.head}>
                <h4>Team Members <span>({teamMember.length})</span></h4>
                <div className={layoutStyles.editButtons}>
                  <button onClick={() => setCreateRole(true)} className={layoutStyles.blueBtn}>Create Role</button>
                  <button onClick={() => setInvitePeopleModal(true)} className={layoutStyles.blueBgBtn}>Invite People</button>
                </div>
              </div>
              <div>
                <table className={styles.teamMemberTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email address</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      teamMember.map((el, i) => {

                        return <tr key={"team_member" + i}>
                          <td>{el.username}</td>
                          <td>{el.email}</td>
                          <td>
                            {
                              el.role_name == "Owner" ? el.role_name
                                :
                                <select className={styles.roleDropdown} value={el.role_name} onChange={(e) => memberRoleUpdateHandler(el.user_id, e.target.value)}>
                                  {/* <option value={el.role_name}>{el.role_name}</option> */}
                                  {
                                    roleNames.map((opt, i) => {
                                      // if (el.role_name != opt.value) {
                                      // }
                                      return <option key={"roleoption" + i} value={opt.value}>{opt.label}</option>
                                    })
                                  }
                                </select>
                            }
                          </td>
                        </tr>
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
            :
            <div className={layoutStyles.headContentBox}>
              <div className={layoutStyles.head}>
                <h4>Create Role</h4>
                <div className={layoutStyles.editButtons}>
                  {
                    (selectRoleName.label && selectRoleName.id) ? <button onClick={deleteRoleHandler} className={layoutStyles.customRedBgbtn}>Delete</button> : null
                  }
                  <button onClick={discardRoleHandler} className={layoutStyles.blueBtn}>Discard</button>
                  <button disabled={saveRoleBtn} onClick={saveRoleHandler} className={layoutStyles.blueBgBtn}>Save</button>
                </div>
              </div>
              <div className={layoutStyles.textBox + ' ' + styles.roleNameBox}>
                <div className={styles.inputBox}>
                  <label htmlFor="rolename">Role Name</label>
                  <div className='p-d-flex w-100 p-ai-center'>
                    <InputText id="rolename" name="rolename" type="text" placeholder='Create new role' value={createRoleName} onChange={(e) => createNewDataInputHandler(e)} />
                    <span className='p-mx-2'>or</span>
                    <Dropdown className={styles.selectRoleDropdown} value={selectRoleName.label} options={roleNames} onChange={(e) => selectEditRoleHandler(e)} placeholder="Select a Role" />
                  </div>
                </div>
              </div>
              <div className={layoutStyles.textBox}>
                <div className={styles.profileForm + ' ' + styles.createRoleGroup}>
                  <div className={styles.inputBox}>
                    <label htmlFor="name">Scope Name</label>
                    <InputText id="name" name="name" type="text" value={addScopeData.name} onChange={(e) => addScopeFieldsHandler(e.target.name, e.target.value, false)} />
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="slug">Scope Slug</label>
                    <InputText id="slug" name="slug" type="text" value={addScopeData.slug} onChange={(e) => addScopeFieldsHandler(e.target.name, e.target.value.toLocaleLowerCase(), false)} />
                  </div>
                  <div className={styles.radioButtons}>
                    <div className={styles.radioBox}>
                      <label htmlFor="create">Create</label>
                      <Checkbox id="create" name="create" checked={addScopeData.access.create} onChange={(e) => addScopeFieldsHandler("create", !addScopeData.access.create, true)} />
                    </div>
                    <div className={styles.radioBox}>
                      <label htmlFor="read">Read</label>
                      <Checkbox id="read" name="read" checked={addScopeData.access.read} onChange={(e) => addScopeFieldsHandler("read", !addScopeData.access.read, true)} />
                    </div>
                    <div className={styles.radioBox}>
                      <label htmlFor="update">Update</label>
                      <Checkbox id="update" name="update" checked={addScopeData.access.update} onChange={(e) => addScopeFieldsHandler("update", !addScopeData.access.update, true)} />
                    </div>
                    <div className={styles.radioBox}>
                      <label htmlFor="delete">Delete</label>
                      <Checkbox id="delete" name="delete" checked={addScopeData.access.delete} onChange={(e) => addScopeFieldsHandler("delete", !addScopeData.access.delete, true)} />
                    </div>
                  </div>
                  <div className="p-mt-3 p-ml-auto">
                    <button onClick={addScopeHandler} className={layoutStyles.customBluebtn + ' p-m-0'}>Add Scope</button>
                  </div>
                </div>
              </div>
              <div className={styles.teamMembertableBox}>
                <table className={styles.teamMemberTable + ' ' + styles.createRoleTable}>
                  <thead>
                    <tr>
                      <th>Scope name</th>
                      <th>Scope slug</th>
                      <th>Create</th>
                      <th>Read</th>
                      <th>Update</th>
                      <th>Delete</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      !createRoleScopeData.scopes.length ?
                        <tr>
                          <td colSpan={7}>Please Add Scope</td>
                        </tr>
                        :
                        [...createRoleScopeData.scopes].map((el, i) => {
                          return <tr key={"create_role" + i}>
                            <td>{el.name}</td>
                            <td>{el.slug}</td>
                            <td>
                              {
                                el.access.create ?
                                  <BsCheck2Square />
                                  :
                                  <BsSquare />
                              }
                            </td>
                            <td>
                              {
                                el.access.read ?
                                  <BsCheck2Square />
                                  :
                                  <BsSquare />
                              }
                            </td>
                            <td>
                              {
                                el.access.update ?
                                  <BsCheck2Square />
                                  :
                                  <BsSquare />
                              }
                            </td>
                            <td>
                              {
                                el.access.delete ?
                                  <BsCheck2Square />
                                  :
                                  <BsSquare />
                              }
                            </td>
                            <td>
                              <button onClick={() => editScopeHandler(i)} className={layoutStyles.customBluebtn + ' p-m-1'}>Edit</button>
                              <button onClick={() => deleteScopeHandler(i)} className={layoutStyles.customRedbtn + ' p-m-1'}>Delete</button>
                            </td>
                          </tr>
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
        }
      </div>

      {/* Invite People */}
      <Modal
        isOpen={invitePeopleModal}
        style={addNewFieldModalCustomStyles}
        contentLabel="Add New Field Modal"
        ariaHideApp={false}
      >
        <div className={styles.invitePeopleModal}>
          <h5>Invite People</h5>
          <div className={styles.inputFields}>
            <div className={styles.inputBox}>
              <label htmlFor="inviteName">Name</label>
              <InputText id="inviteName" name="name" type="text" value={inviteFields.name} onChange={(e) => inviteFieldsHandler("name", e.target.value)} />
            </div>
            <div className={styles.inputBox}>
              <label htmlFor="inviteEmail">Email</label>
              <InputText id="inviteEmail" name="email" type="text" value={inviteFields.email} onChange={(e) => inviteFieldsHandler("email", e.target.value)} />
            </div>
            <div className={styles.inputBox}>
              <label htmlFor="inviteRole">Role</label>
              <select name="role" id="inviteRole" defaultValue={inviteFields.role} onChange={(e) => inviteFieldsHandler("role", e.target.value)} >
                {
                  roleNames.map(op => <option key={op.value} value={op.value}>{op.label}</option>)
                }
              </select>
            </div>
            <div className="p-d-flex p-ai-center p-mt-4">
              <div className="p-m-auto">
                <button onClick={sendInviteHandler} className={layoutStyles.customBlueBgbtn}>Save</button>
                <button onClick={() => setInvitePeopleModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default withProtectSync(Team)

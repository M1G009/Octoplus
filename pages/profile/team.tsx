// React Module Imports
import { useEffect, useState } from 'react';

// Next Module Imports
import { useRouter } from 'next/router';
import type { NextPage } from 'next'

// Prime React Imports
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { confirmDialog } from 'primereact/confirmdialog';

// 3rd Party Imports
import * as yup from 'yup';
import { ErrorMessage, Formik, Field, FormikHelpers } from 'formik';
import { BsCheck2Square, BsSquare } from "react-icons/bs";
import { ToastContainer } from "react-toastify";
import slugify from 'slugify'
import toast from "../../components/Toast";

// Style and Component Imports
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';
import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/profile.module.scss';

// Interface/Helper Imports
import service from '../../helper/api/api';




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
  id: string;
}

export interface RoleData {
  _id: string;
  role: ICreateRoleScopeData;
}

export interface InviteFields {
  name: string;
  email: string;
  role: RoleNames
}

const Team: NextPage = (props: any) => {
  const router = useRouter();
  // States starts
  const [formSpinner, setFormSpinner] = useState(false);
  const [createRole, setCreateRole] = useState(false);
  const [invitePeopleModal, setInvitePeopleModal] = useState(false);
  const [createRoleName, setCreateRoleName] = useState('');
  const [selectRoleName, setSelectRoleName] = useState({ label: '', id: '' });
  const [selectScopeName, setSelectScopeName] = useState(["Reports access", "Merge access", "CSV upload access", "Registry access"]);
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
  const [editScopeIndex, setEditScopeIndex] = useState(-1);
  const [roleNames, setRoleNames] = useState<RoleNames[]>([]);
  const [roleData, setRoleData] = useState<RoleData[]>();
  const [teamMember, setTeamMember] = useState<TeamMember[]>([])
  const [editScopeSpinner, setEditScopeSpinner] = useState(false)

  // States Ends
  const fetchAllRoles = async () => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      const { data } = await service({
        url: `${process.env.API_BASE_URL}/getroles`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });

      if (!data.data.role_list.length) {
        return setRoleData([]);
      }
      setRoleData(data.data.roles);
      let roleArray: any[] = []
      data.data.role_list.map((li: any) => roleArray.push({ label: li.Label, id: li._id }))
      setRoleNames(roleArray);
    } catch (err) {
      return await toast({ type: "error", message: err });
    }
  }

  const getTeamMembers = async () => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      const { data } = await service({
        url: `${process.env.API_BASE_URL}/getusers`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });

      if (!data.data.length) {
        return setTeamMember([]);
      }
      setTeamMember(data.data);
    } catch (err) {
      return toast({ type: "error", message: err });
    }
  }

  // Handlers Start
  useEffect(() => {
    getTeamMembers();
    fetchAllRoles();
  }, [])

  const validationSchema = yup.object().shape({
    name: yup.string().required('Please enter name'),
    email: yup.string().required('Please enter email').email("Please enter valid email")
  });

  const addScopeFieldsHandler = (key: any, value: any, access: boolean) => {
    if (access) {
      let copiedAccess = Object.assign({ ...addScopeData.access }, { [key]: value });
      return setAddScopeData(prevState => ({ ...prevState, ['access']: copiedAccess }));
    }
    setAddScopeData(prevState => ({ ...prevState, [key]: value }));
  }

  const addScopeHandler = () => {
    let newScope = { ...addScopeData };
    let slug = slugify(newScope['name'], { replacement: '-', remove: undefined, lower: true, strict: false, locale: 'vi', trim: true})
    newScope['slug'] = slug;
    
    
    const isEmpty = Object.values(newScope).some(el => el === '');

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

  const editScopeHandler = (index: number) => {
    setEditScopeSpinner(true)
    setTimeout(() => {
      setEditScopeSpinner(false)
    }, 1000)
    setEditScopeIndex(index);
    let scopeOfRoleArray = createRoleScopeData.scopes.slice();
    setAddScopeData(scopeOfRoleArray[index]);
  }

  const deleteScopeHandler = (index: number) => {
    let scopeOfRoleArray = createRoleScopeData.scopes.slice();
    scopeOfRoleArray.splice(index, 1);
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
    toast({ type: "success", message: "Delete Role Successful" });
  }

  const resetRoleFields = () => {
    setCreateRoleScopeData({
      name: "",
      scopes: []
    })
    setCreateRoleName('');
    setSelectRoleName({ label: '', id: '' })
    setSaveRoleBtn(false);
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
    setCreateRole(false);
  }

  const saveRoleHandler = async () => {
    try {
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      // if => Update exist role
      // else => Create role
      if (selectRoleName.label && selectRoleName.id) {
        let editRoleObj = { role_id: selectRoleName.id, role: createRoleScopeData }
        setSaveRoleBtn(true);
        const { data } = await service({
          url: `${process.env.API_BASE_URL}/editrole`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
          data: JSON.stringify(editRoleObj),
        });
        toast({ type: "success", message: "Update role successful" });
        setSaveRoleBtn(false);

        // Fetch all roles with currently updated role
        await fetchAllRoles()
        return resetRoleFields();

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
          const { data } = await service({
            url: `${process.env.API_BASE_URL}/createrole`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
            data: JSON.stringify(createRoleObj),
          });
          toast({ type: "success", message: "Create new role successful" });
          setSaveRoleBtn(false);
          setCreateRoleScopeData({
            name: "",
            scopes: []
          })
          setCreateRoleName('');
          setSelectRoleName({ label: '', id: '' })
          await fetchAllRoles()
          return resetRoleFields();
        }
      }
    } catch (err) {
      setSaveRoleBtn(false);
      return await toast({ type: "error", message: err });
    }
  }

  const discardRoleHandler = () => {
    resetRoleFields();
  }

  const selectEditRoleHandler = async (e: any) => {
    setCreateRoleName('');

    if (roleData) {
      let curruntObj = Object.assign({}, roleData[e.target.value.label]);
      setSelectRoleName({ label: e.value, id: curruntObj._id });
      setCreateRoleScopeData(curruntObj.role)
    }
  }

  const createNewDataInputHandler = (e: any) => {
    setCreateRoleName(e.target.value);
    setSelectRoleName({ label: '', id: '' });
  }

  const deleteRoleHandler = async () => {
    try {
      if (selectRoleName.label && selectRoleName.id) {
        let deleteRole = { role_id: selectRoleName.id }

        let authToken = await window.localStorage.getItem('authToken');

        if (!authToken) {
          window.localStorage.removeItem("authToken")
          window.localStorage.removeItem("ValidUser")
          window.localStorage.removeItem('loginUserdata');
          return router.push('/auth');
        }

        await service({
          url: `${process.env.API_BASE_URL}/deleterole`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
          data: JSON.stringify(deleteRole),
        });

        toast({ type: "success", message: "Delete role successful" });
        setCreateRoleScopeData({
          name: "",
          scopes: []
        })
        setCreateRoleName('');
        setSelectRoleName({ label: '', id: '' })

        await fetchAllRoles()
        return resetRoleFields();
      }
    } catch (err) {
      return toast({ type: "error", message: err });
    }
  }

  const deleteRoleConfirmHandler = () => {
    confirmDialog({
      message: 'Are you sure you want to delete the Role ?',
      header: 'Delete Account',
      icon: 'pi pi-info-circle',
      acceptClassName: layoutStyles.customRedBgbtn,
      accept: deleteRoleHandler
    });
  }

  const sendInviteHandler = async (getData: any) => {
    try {
      let inviteFields = JSON.parse(getData);
      inviteFields.role = inviteFields.role.label;
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      const { data } = await service({
        url: `${process.env.API_BASE_URL}/invite_send`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
        data: inviteFields
      });

      toast({ type: "success", message: data.message });
      return setInvitePeopleModal(false)

    } catch (err) {
      return toast({ type: "error", message: err });
    }
  }

  const memberRoleUpdateHandler = async (id: any, value: any) => {
    try {
      if (roleData) {
        let createUpdateRoleObj = { _id: id, role: roleData[value].role }
        let authToken = await window.localStorage.getItem('authToken');

        if (!authToken) {
          window.localStorage.removeItem("authToken")
          window.localStorage.removeItem("ValidUser")
          window.localStorage.removeItem('loginUserdata');
          return router.push('/auth');
        }

        await service({
          url: `${process.env.API_BASE_URL}/roleupdate`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
          data: JSON.stringify(createUpdateRoleObj),
        });

        toast({ type: "success", message: "Role update successful" });
        await getTeamMembers();
        await fetchAllRoles();
      }
    } catch (err) {
      return toast({ type: "error", message: err });
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
                  <button onClick={() => setCreateRole(true)} className={layoutStyles.blueBtn}>Create & Edit Role</button>
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
                      teamMember.length ?
                        teamMember.map((el, i) => {

                          return <tr key={"team_member" + i}>
                            <td>{el.username}</td>
                            <td>{el.email}</td>
                            <td>
                              {
                                el.role_name == "Owner" ? el.role_name
                                  :
                                  <select className={styles.roleDropdown} value={el.role_name} onChange={(e) => memberRoleUpdateHandler(el.user_id, e.target.value)}>
                                    {
                                      roleNames.map((opt, i) => {
                                        return <option key={"roleoption" + i} value={opt.label}>{opt.label}</option>
                                      })
                                    }
                                  </select>
                              }
                            </td>
                          </tr>
                        })
                        :
                        <tr>
                          <td colSpan={3} align='center'>No data found</td>
                        </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
            :
            <div className={layoutStyles.headContentBox}>
              <div className={layoutStyles.head}>
                <h4>Create & Edit Role</h4>
                <div className={layoutStyles.editButtons}>
                  {
                    (selectRoleName.label && selectRoleName.id) ? <button onClick={deleteRoleConfirmHandler} className={layoutStyles.customRedBgbtn}>Delete</button> : null
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
                  {
                    editScopeSpinner ? <div className={styles.formSpinner}>
                      <div className={styles.loading}></div>
                    </div> : null
                  }
                  <div className={styles.inputBox}>
                    <label htmlFor="name">Scope Name</label>
                    {/* <InputText id="name" name="name" type="text" value={addScopeData.name} onChange={(e) => addScopeFieldsHandler(e.target.name, e.target.value, false)} /> */}
                    <Dropdown className={styles.selectRoleDropdown} id="name" name='name' value={addScopeData.name} options={selectScopeName} onChange={(e) => addScopeFieldsHandler(e.target.name, e.target.value, false)} placeholder="Select a Scope" />
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
                  <div className="p-mt-3 p-mx-auto">
                    <button onClick={addScopeHandler} className={layoutStyles.customBluebtn + ' p-m-auto'}>{editScopeIndex >= 0 ? "Save Edit" : "Add Scope"}</button>
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
      <Dialog showHeader={false} contentClassName={styles.invitePeopleModal} visible={invitePeopleModal} style={{ width: '500px', }} onHide={() => ''}>
        <div className={styles.invitePeopleModal}>
          <h5>Invite People</h5>
          <Formik
            enableReinitialize
            initialValues={{
              name: '',
              email: '',
              role: { label: 'Testing', id: '61c80fa7b46f3dca7d5bdcfb' }
            }}
            validationSchema={validationSchema}
            onSubmit={(
              values: InviteFields,
              { setSubmitting }: FormikHelpers<InviteFields>
            ) => {
              sendInviteHandler(JSON.stringify(values, null, 2));
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
                    <label htmlFor="inviteName">Name</label>
                    <div>
                      <Field type="text" name="name" />
                      <ErrorMessage name="name">
                        {(msg) => <p className={styles.error}>{msg}</p>}
                      </ErrorMessage>
                    </div>
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="inviteEmail">Email</label>
                    <div>
                      <Field type="text" name="email" />
                      <ErrorMessage name="email">
                        {(msg) => <p className={styles.error}>{msg}</p>}
                      </ErrorMessage>
                    </div>
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="inviteRole">Role</label>
                    {
                      roleNames ?
                        <Dropdown id="inviteRole" className={styles.selectBox} name="role" value={props.values.role} options={roleNames} optionLabel="label" onChange={(e: any) => props.setFieldValue('role', e.target.value)} /> : ''
                    }
                  </div>
                  <div className="p-d-flex p-ai-center p-mt-4">
                    <div className="p-m-auto">
                      <button type='submit' className={layoutStyles.customBlueBgbtn}>Save</button>
                      <button type='button' onClick={() => setInvitePeopleModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
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

export default withProtectSync(Team)

// React Module Imports
import React, { useState } from "react";

// Next Module Imports

// Prime React Imports
import { InputText } from 'primereact/inputtext';

// 3rd Party Imports
import { BsThreeDotsVertical, BsFillDashCircleFill, BsCheckLg } from "react-icons/bs";
import { BiEditAlt } from "react-icons/bi";

// Style and Component Imports
import styles from "../components/DragDrop.module.scss"

// Interface/Helper Imports


const DragDrop = (props: any) => {
  let tasks = props.tasks;
  let setColumns = props.setColumns;
  let editHandler = props.editHandler;
  let setEditNameHandler = props.setEditNameHandler;
  let saveColumnHandler = props.saveColumnHandler;
  let setDeleteColumnModal = props.setDeleteColumnModal;
  let setDeleteColumnName =props.setDeleteColumnName;
  let hideShowColumnHandler = props.hideShowColumnHandler;
  const [dragged, setDragged] = useState<HTMLElement | null>(null);
  const [over, setOver] = useState<HTMLElement | null>(null);

  const onDragStart = (evt: any) => {
    setDragged(evt.currentTarget)
    let element = evt.currentTarget;
    element.classList.add(styles.dragged);
    evt.dataTransfer.setData("text/plain", evt.currentTarget.id);
    // evt.dataTransfer.effectAllowed = "move";
  };

  const onDragEnd = (evt: any) => {
    if (dragged) {
      dragged.style.display = 'flex';
      evt.target.classList.remove(styles.dragUp);
      evt.target.classList.remove(styles.dragDown);
    }

    if (over) {
      over.classList.remove(styles.dragDown);
      over.classList.remove(styles.dragUp);
    }

    evt.currentTarget.classList.remove(styles.dragged);
    if (dragged) {
      dragged.style.display = "flex";
    }
  };

  const onDragEnter = (evt: any) => {
    evt.preventDefault();
    let element = evt.currentTarget;
    element.classList.add(styles.draggedOver);
    // evt.dataTransfer.dropEffect = "move";
  };

  const onDragLeave = (evt: any) => {
    evt.preventDefault();
    let currentTarget = evt.currentTarget;
    let newTarget = evt.relatedTarget;
    if (newTarget && newTarget.parentNode === currentTarget || newTarget === currentTarget)
      return;
    let element = evt.currentTarget;
    element.classList.remove(styles.draggedOver);
  };

  const onDragOver = (evt: any) => {
    evt.preventDefault();
    // evt.dataTransfer.dropEffect = "move";
    if (dragged) {
      dragged.style.display = "none";
      if (over) {
        let dgIndex = Number(dragged.getAttribute('id'));
        let taIndex = Number(over.getAttribute('id'));
        const animateName = dgIndex > taIndex ? styles.dragUp : styles.dragDown;

        if (over && evt.target.dataset.item !== over.dataset.item) {
          over.classList.remove(styles.dragUp, styles.dragDown);
        }

        if (!evt.target.classList.contains(animateName)) {
          evt.target.classList.add(animateName);
        }

      }
    }
    if (!evt.target.classList.contains(styles.inputWrapper)) {
      if (evt.target.tagName == "INPUT") {
        let dragId = evt.target.parentNode.parentNode.getAttribute('id');
        if (dragId >= 0) {
          if (dragged) {
            return setOver(evt.target.parentNode.parentNode);
          }
        } else {
          return;
        }
      } else {
        return;
      }
    }
    if (dragged) {
      setOver(evt.target);
    }
  };

  const onDrop = (evt: any, value: any) => {
    evt.preventDefault();
    if (over && dragged) {
      let from = Number(dragged.getAttribute('id'));
      let to = Number(over.getAttribute('id'));

      var columnData = [...tasks];      
      columnData.splice(to, 0, columnData.splice(from, 1)[0]);

      columnData = columnData.map((task: any) => {
        if (task.id == from) task.hide = value;
        return task;
      });
      // set newIndex to judge direction of drag and drop
      columnData = columnData.map((doc, index) => {
        doc.id = index;
        return doc;
      })
      console.log(columnData);
      
      hideShowColumnHandler(columnData);
      setColumns(columnData);
    }

  };

  const deleteColumnIdHandler = (name: string) =>{
    setDeleteColumnName(name);
    setDeleteColumnModal(true);
  }

  let pending = [...tasks].filter(t => !t.hide);

  let hide = [...tasks].filter(t => t.hide);
  let className = (readonly: boolean) => {
    if (!readonly) {
      return styles.inputBox + " p-inputgroup " + styles.inputBox + " " + styles.inputFocus;
    } else {
      return styles.inputBox + " p-inputgroup " + styles.inputBox;
    }
  }
  return (
    <div className={styles.dragDropBox}>
      <div
        className={styles.pending + " " + styles.smallBox}
        onDragLeave={e => onDragLeave(e)}
        onDragEnter={e => onDragEnter(e)}
        onDragEnd={e => onDragEnd(e)}
        onDragOver={e => onDragOver(e)}
        onDrop={e => onDrop(e, false)}
      >
        <h3 className={styles.boxTitle}>Show Column</h3>
        {pending.map((task: any) => (
          <div
            className={styles.inputWrapper}
            key={task.name}
            id={task.id}
            draggable
            onDragStart={e => onDragStart(e)}
            onDragEnd={e => onDragEnd(e)}
          >
            <button className={styles.threeDot} ><BsThreeDotsVertical /></button>
            <div className={className(task.readonly)}>
              <InputText readOnly={task.readonly} value={task.editedName} placeholder="Keyword" onChange={(e) => setEditNameHandler(e.target.value, task.id)} />
              {
                task.readonly ?
                  <button className={styles.editIcon} onClick={() => editHandler(task.id)} ><BiEditAlt /></button>
                  :
                  <button className={styles.editIcon} onClick={() => saveColumnHandler(task.id)}><BsCheckLg /></button>
              }
            </div>
            <button className={styles.deleteIcon} onClick={() => deleteColumnIdHandler(task.name)}><BsFillDashCircleFill /></button>
          </div>
        ))}
      </div>
      <div
        className={styles.done + " " + styles.smallBox}
        onDragLeave={e => onDragLeave(e)}
        onDragEnter={e => onDragEnter(e)}
        onDragEnd={e => onDragEnd(e)}
        onDragOver={e => onDragOver(e)}
        onDrop={e => onDrop(e, true)}
      >
        <h3 className={styles.boxTitle}>Hide Column</h3>
        {hide.map(task => (
          <div
            className={styles.inputWrapper}
            key={task.name}
            id={task.id}
            draggable
            onDragStart={e => onDragStart(e)}
            onDragEnd={e => onDragEnd(e)}
          >
            <button className={styles.threeDot} ><BsThreeDotsVertical /></button>
            <div className={className(task.readonly)}>
              <InputText readOnly={task.readonly} value={task.editedName} placeholder="Keyword" onChange={(e) => setEditNameHandler(e.target.value, task.id)} />
              {
                task.readonly ?
                  <button className={styles.editIcon} onClick={() => editHandler(task.id)} ><BiEditAlt /></button>
                  :
                  <button className={styles.editIcon} onClick={() => saveColumnHandler(task.id)}><BsCheckLg /></button>
              }
            </div>
            <button className={styles.deleteIcon} onClick={() => deleteColumnIdHandler(task.name)}><BsFillDashCircleFill /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DragDrop
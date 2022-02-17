import React, { useState } from 'react'

const Box = (props: any) => {
    return (
        props.box ?
            <span
                className={props.className}
                draggable={props.draggable}
                onDragStart={props.onDragStart({ id: props.id })}
                onDragOver={props.onDragOver({ id: props.id })}
                onDrop={props.onDrop({ id: props.id })}
            >
                {props.box}
            </span>
            :
            <span
                className={props.classNameIgnore}
                draggable={props.draggable}
                onDragStart={props.onDragStart({ id: props.id })}
                onDragOver={props.onDragOver({ id: props.id })}
                onDrop={props.onDrop({ id: props.id })}
            >
                 
            </span>

    )
}

const DragSwap = (props: any) => {
    const boxes = props.mappingRegistryColumn;

    const swapBoxes = (fromBox: any, toBox: any) => {
        let copyBoxes: any = [...boxes].slice();
        let fromIndex = -1;
        let toIndex = -1;

        for (let i = 0; i < copyBoxes.length; i++) {
            if (i === fromBox.id) {
                fromIndex = i;
            }
            if (i === toBox.id) {
                toIndex = i;
            }
        }
        
        if (fromIndex != -1 && toIndex != -1) {
            let temp = copyBoxes[fromIndex];
            copyBoxes[fromIndex] = copyBoxes[toIndex];
            copyBoxes[toIndex] = temp;

            props.setMapppingTabledata(copyBoxes)
        }
    };

    /* The dragstart event is fired when the user starts dragging an element or text selection */
    /* event.target is the source element : that is dragged */
    /* Firefox requires calling dataTransfer.setData for the drag to properly work */
    const handleDragStart = (data: any) => (event: any) => {
        let fromBox = JSON.stringify({ id: data.id });
        event.dataTransfer.setData("dragContent", fromBox);
    };

    /* The dragover event is fired when an element or text selection is being dragged */
    /* over a valid drop target (every few hundred milliseconds) */
    /* The event is fired on the drop target(s) */
    const handleDragOver = (data: any) => (event: any) => {
        event.preventDefault(); // Necessary. Allows us to drop.
        return false;
    };

    /* Fired when an element or text selection is dropped on a valid drop target */
    /* The event is fired on the drop target(s) */
    const handleDrop = (data: any) => (event: any) => {
        event.preventDefault();

        let fromBox = JSON.parse(event.dataTransfer.getData("dragContent"));
        
        let toBox = { id: data.id };

        swapBoxes(fromBox, toBox);
        return false;
    };

    const makeBoxes = () => {
        if (boxes) {
            return boxes.map((box: any, i: number) => (
                <Box
                    box={box}
                    id={i}
                    key={"columnsBoxes" + i}
                    draggable="true"
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={props.className}
                    classNameIgnore={props.classNameIgnore}
                />
            ));
        }
    };
    return (
        <>{makeBoxes()}</>
    )
}

export default DragSwap
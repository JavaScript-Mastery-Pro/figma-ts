// @ts-nocheck
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

export const handleCopy = (canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length > 0) {
    // Serialize the selected objects
    const serializedObjects = activeObjects.map((obj) => obj.toObject());
    // Store the serialized objects in the clipboard
    localStorage.setItem("clipboard", JSON.stringify(serializedObjects));
  }

  return activeObjects;
};

export const handlePaste = (canvas) => {
  if (!canvas || !(canvas instanceof fabric.Canvas)) {
    console.error("Invalid canvas object. Aborting paste operation.");
    return;
  }

  // Retrieve serialized objects from the clipboard
  const clipboardData = localStorage.getItem("clipboard");

  if (clipboardData) {
    try {
      const parsedObjects = JSON.parse(clipboardData);
      parsedObjects.forEach((objData) => {
        // convert the plain javascript objects retrieved from localStorage into fabricjs objects (deserialization)
        fabric.util.enlivenObjects([objData], (enlivenedObjects) => {
          enlivenedObjects.forEach((enlivenedObj) => {
            // Offset the pasted objects to avoid overlap with existing objects
            enlivenedObj.set({
              left: enlivenedObj.left + 20,
              top: enlivenedObj.top + 20,
              objectId: uuidv4(),
              fill: "#aabbcc",
            });
            canvas.add(enlivenedObj);
          });
          canvas.renderAll();
        });
      });
    } catch (error) {
      console.error("Error parsing clipboard data:", error);
    }
  }
};

export const handleDelete = (canvas, deleteShapeFromStorage) => {
  const activeObjects = canvas.getActiveObjects();

  if (activeObjects.length > 0) {
    activeObjects.forEach((obj) => {
      // deleteShapeFromStorage(obj.objectId);
      canvas.remove(obj);
    });
  }

  canvas.discardActiveObject();
  canvas.requestRenderAll();
};

// create a handleKeyDown function that listen to different keydown events
export const handleKeyDown = (
  e,
  canvas,
  undo,
  redo,
  deleteShapeFromStorage
) => {
  // Check if the key pressed is ctrl/cmd + c (copy)
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 67) {
    handleCopy(canvas);
  }

  // Check if the key pressed is ctrl/cmd + v (paste)
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 86) {
    handlePaste(canvas);
  }

  // Check if the key pressed is delete/backspace (delete)
  // if (e.keyCode === 8 || e.keyCode === 46) {
  //   handleDelete(canvas, deleteShapeFromStorage);
  // }

  // check if the key pressed is ctrl/cmd + x (cut)
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 88) {
    handleCopy(canvas);
    handleDelete(canvas, deleteShapeFromStorage);
  }

  // check if the key pressed is ctrl/cmd + z (undo)
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 90) {
    undo();
  }

  // check if the key pressed is ctrl/cmd + y (redo)
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 89) {
    redo();
  }

  if (e.keyCode === "/") {
    e.preventDefault();
  }
};

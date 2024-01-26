// ignore whole file typescript error
// @ts-nocheck

import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

export const createRectangle = (pointer) => {
  const rect = new fabric.Rect({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: "#aabbcc",
    objectId: uuidv4(),
  });

  return rect;
};

export const createTriangle = (pointer) => {
  return new fabric.Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: "#aabbcc",
    objectId: uuidv4(),
  });
};

export const createCircle = (pointer) => {
  return new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 100,
    fill: "#aabbcc",
    objectId: uuidv4(),
  });
};

export const createLine = (pointer) => {
  return new fabric.Line(
    [pointer.x, pointer.y, pointer.x + 100, pointer.y + 100],
    {
      stroke: "#aabbcc",
      strokeWidth: 2,
      objectId: uuidv4(),
    }
  );
};

export const createText = (pointer, text) => {
  return new fabric.IText(text, {
    left: pointer.x,
    top: pointer.y,
    fill: "#aabbcc",
    objectId: uuidv4(),
  });
};

export const createSpecificShape = (shapeType, pointer) => {
  switch (shapeType) {
    case "rectangle":
      return createRectangle(pointer);

    case "triangle":
      return createTriangle(pointer);

    case "circle":
      return createCircle(pointer);

    case "line":
      return createLine(pointer);

    case "text":
      return createText(pointer, "Tap to Type");

    default:
      return null;
  }
};

export const handleImageUpload = (file) => {
  const reader = new FileReader();

  reader.onload = () => {
    fabric.Image.fromURL(reader.result, (img) => {
      img.scaleToWidth(200);
      img.scaleToHeight(200);

      // canvas.current.add(img);
      // img.objectId = uuidv4();

      // syncShapeInStorage(img);
      // canvas.current.requestRenderAll();
    });
  };

  reader.readAsDataURL(file);
};

export const createShape = (canvas, pointer, shapeType) => {
  if (shapeType === "freeform") {
    canvas.isDrawingMode = true;
    return null;
  }

  return createSpecificShape(shapeType, pointer);
};

export const modifyShape = (
  canvas,
  property,
  value,
  activeObjectRef,
  syncShapeInStorage
) => {
  const selectedElement = canvas.getActiveObject();

  if (!selectedElement || selectedElement?.type === "activeSelection") return;

  console.log("modify shape", selectedElement[property], value);

  // if property is width or height, we need to use scaleToWidth or scaleToHeight
  if (property === "width") {
    selectedElement.scaleToWidth(value);
  } else if (property === "height") {
    selectedElement.scaleToHeight(value);
    canvas.requestRenderAll();
  } else {
    if (selectedElement[property] === value) return;
    selectedElement.set(property, value);
  }

  // set selectedElement to activeObjectRef
  activeObjectRef.current = selectedElement;

  canvas.requestRenderAll();

  syncShapeInStorage(selectedElement);
};

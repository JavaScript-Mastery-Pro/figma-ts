import { useMutation } from "@/liveblocks.config";

// export const updateShapeInStorage = useMutation(
//   ({ storage }, shapeId, shapeData) => {
//     const canvasObjects = storage.get("canvas" as never);
//     // @ts-ignore
//     canvasObjects.set(shapeId, shapeData);
//   },
//   []
// );

// export function getUpdateShapeInStorageMutation() {
//     return useMutation(
//       ({ storage }, shapeId, shapeData) => {
//         const canvasObjects = storage.get("canvas" as never);
//         // @ts-ignore
//         canvasObjects.set(shapeId, shapeData);
//       },
//       []
//     );
//   }

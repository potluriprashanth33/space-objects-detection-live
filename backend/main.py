# backend/main.py
from fastapi import FastAPI, File, UploadFile, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import base64
import json
import asyncio

app = FastAPI(title="SPACED YOLO Detection API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your trained YOLO model
model = YOLO('runs/detect/train/weights/best.pt')  # Your trained model

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """Detect objects in uploaded image"""
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Run YOLO detection
        results = model(image, conf=0.5)
        
        # Process results
        detections = []
        for r in results:
            for box in r.boxes:
                detection = {
                    "class_id": int(box.cls),
                    "class_name": model.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "bbox": box.xyxy[0].tolist(),
                    "bbox_normalized": box.xywhn[0].tolist()
                }
                detections.append(detection)
        
        return {
            "success": True,
            "detections": detections,
            "count": len(detections)
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.websocket("/ws/detect")
async def websocket_detect(websocket: WebSocket):
    """WebSocket endpoint for real-time detection"""
    await websocket.accept()
    
    try:
        while True:
            # Receive image data from frontend
            data = await websocket.receive_text()
            image_data = json.loads(data)
            
            # Decode base64 image
            img_bytes = base64.b64decode(image_data['image'].split(',')[1])
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Run detection
            results = model(image, conf=0.5)
            
            # Process and send results
            detections = []
            for r in results:
                for box in r.boxes:
                    detection = {
                        "class_id": int(box.cls),
                        "class_name": model.names[int(box.cls)],
                        "confidence": float(box.conf),
                        "bbox_normalized": box.xywhn[0].tolist()
                    }
                    detections.append(detection)
            
            await websocket.send_text(json.dumps({
                "detections": detections,
                "timestamp": asyncio.get_event_loop().time()
            }))
            
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

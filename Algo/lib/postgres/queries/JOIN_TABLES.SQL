SELECT files.name, detection.start_time 
FROM files JOIN ON detections.file = files.id;
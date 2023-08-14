import { useEffect, useState, useRef, useCallback } from "react";
import { scanImage, scanPdf } from "./utils/mrzReader";
import moment from "moment";
import {
  Overlay,
  ViewerWrapper,
  Header,
  Body,
  ImageOuter,
  Footer,
  Button
} from "./styles";
import Webcam from "react-webcam";

const parseDate = (yymmddDate) => {
  if (!yymmddDate) {
    return "";
  }
  return moment(yymmddDate, "YYMMDD").format("DD-MMM-YYYY");
};

const preScanImageFirstRender = (imgObject) => {
  console.log("imgObject", imgObject);
  if (imgObject) {
    const { clientWidth, clientHeight } = imgObject;
    console.log("imge Parent info", { clientWidth, clientHeight });
    return {
      orentation: clientWidth > clientHeight ? "landscape" : "portrait",
      renderWidth: clientWidth,
      renderHeight: clientHeight,
      width: "not calculated",
      height: "not calculated"
    };
  }

  return {};
};

const IFRAME_PROCESS = true;
export default function App() {
  const [rotageAngle, setRotateAngle] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [fileData, setFileData] = useState({});
  const [toggleWith, setToggleWidth] = useState({ width: 0, height: 0 });
  const [ocrData, setOcrData] = useState({});
  const inputRef = useRef(null);
  const imgRef = useRef(null);
  const iframeRef = useRef(null);

  const handleRotate = (evt) => {
    evt.preventDefault();
    setRotateAngle(rotageAngle + 90);
    console.log("Rotate From=>", rotageAngle);
    const { width, height } = toggleWith;
    setToggleWidth({ width: height, height: width });

    //preScanImageFirstRender(imgRef.current);
  };

  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    scanImage(imageSrc, updateInfo);
  }, [webcamRef, setImgSrc]);
  const handleOnChange = (evt) => {
    evt.preventDefault();
    setOcrData({});
    console.log(evt.target.files[0]);
    if (evt.target.files[0]) {
      setFileData({
        url: URL.createObjectURL(evt.target.files[0]),
        type: evt.target.files[0].type
      });
    }
  };

  const handleRetake = (evt) => {
    evt.preventDefault();
    if (fileData.url) {
      URL.revokeObjectURL(fileData.url);
      console.log("rewoke URL", fileData.url);
      setFileData({});
      inputRef.current.value = "";
      inputRef.current.click();
    }
    setOcrData({});
    return true;
  };

  const updateInfo = (info) => {
    const { scanStatus, data } = info || {};
    if (scanStatus === "success") {
      if (data && data.parsed && data.parsed.fields) {
        const passportData = { ...data.parsed.fields };
        passportData.birthDate = parseDate(passportData.birthDate);
        passportData.expirationDate = parseDate(passportData.expirationDate);

        setOcrData({ scanStatus, passportData });
      } else {
        setOcrData({ scanStatus, error: "No OCR Information" });
      }
    }

    if (scanStatus === "progress") {
      setOcrData({ scanStatus, status: data });
    }
    if (scanStatus === "error") {
      setOcrData({ scanStatus, error: "Error in file scan" });
    }
    if (scanStatus === "default") {
      setOcrData({ scanStatus, error: "Unknown error" });
    }
    console.log("updateInfo=>", scanStatus, data);

    if (scanStatus !== "progress") {
      setShowPreview(false);
    }
  };

  const processOCR = () => {
    //scanPassport(fileDataURL);
    let postData = {};
    if (fileData.type && fileData.type.indexOf("pdf") > 0) {
      console.log("** Process for PDF");
      if (!IFRAME_PROCESS) {
        scanPdf(fileData.url, updateInfo);
      }
      postData = { action: "SCAN_PDF", payload: { url: fileData.url } };
    } else {
      if (!IFRAME_PROCESS) {
        scanImage(fileData.url, updateInfo);
      }
      postData = { action: "SCAN_IMAGE", payload: { url: fileData.url } };
    }
    if (!IFRAME_PROCESS) {
      return false;
    }
    const iframeContentWindow = iframeRef.current.contentWindow;

    iframeContentWindow.postMessage(postData);
    console.log(
      "** init post message from the client",
      postData,
      iframeContentWindow
    );
  };

  useEffect(() => {
    if (fileData.url && fileData.url.length > 0) {
      setShowPreview(true);
      setTimeout(() => {
        const {
          renderWidth: width,
          renderHeight: height
        } = preScanImageFirstRender(imgRef.current);
        setToggleWidth({ width, height });
      }, 500);
    } else {
      setShowPreview(false);
    }
  }, [fileData]);

  const receiveMessage = (evt) => {
    console.log("** receiving from the iframe", evt);
    if (evt.data) {
      const { action, payload } = evt.data || {};
      if (action === "SENDING_OCR_DATA") {
        updateInfo(payload.ocrData);
      }
    }
  };

  useEffect(() => {
    // iframeRef.current.contentWindow.
    setTimeout(() => {
      window.addEventListener("message", receiveMessage, false);
    }, 200);

    return () => {
      window.removeEventListener("message", receiveMessage, false);
    };
  }, []);

  return (
    <div className="App">
      <h1>Passport scan with image viewer</h1>
      <button onClick={capture}>Take a photo</button>

      <input type="file" onChange={handleOnChange} ref={inputRef} />
      {fileData.url ? (
        <div onClick={() => setShowPreview(true)}> {fileData.url}</div>
      ) : null}
      {ocrData.error ? <p style={{ color: "red" }}> {ocrData.error}</p> : null}
      {ocrData && ocrData.scanStatus === "success" && ocrData.passportData ? (
        <div
          style={{
            textAlign: "left",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div>
            {fileData.url &&
            fileData.type &&
            fileData.type.indexOf("pdf") === -1 ? (
              <img src={fileData.url} width="250" alt="preview passport" />
            ) : null}
          </div>
          {/* {JSON.stringify(ocrData.data.parsed.fields)} */}
          {Object.keys(ocrData.passportData).map((itemKey, index) => (
            <div key={index} style={{ display: "flex" }}>
              <span style={{ width: "250px" }}>{itemKey}</span>
              <span>{ocrData.passportData[itemKey]}</span>
            </div>
          ))}
        </div>
      ) : null}
      {showPreview && fileData.url ? (
        <Overlay>
          <ViewerWrapper>
            <Header>
              <button onClick={handleRotate}>Rotate</button>
              <button
                onClick={() => {
                  setShowPreview(false);
                }}
              >
                Close
              </button>
            </Header>
            <Body loading={ocrData.scanStatus === "progress" ? "loaging" : ""}>
              <ImageOuter angle={rotageAngle} toggleWith={toggleWith}>
                <div className="img-inner">
                  {fileData.type && fileData.type.indexOf("pdf") === -1 ? (
                    <img
                      id="previewImage"
                      src={fileData.url}
                      alt="user uploads"
                      ref={imgRef}
                    />
                  ) : null}
                </div>
              </ImageOuter>
            </Body>
            <Footer>
              <Button onClick={handleRetake}>Re Take</Button>
              <Button primary onClick={processOCR}>
                Use
              </Button>
            </Footer>
          </ViewerWrapper>
        </Overlay>
      ) : null}

      <div>
        {IFRAME_PROCESS ? (
          <iframe
            width="100%"
            height="200px"
            ref={iframeRef}
            src="ocr-frame/ocr.html"
            title="ocr-processor"
          />
        ) : null}
      </div>
      <>
        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
        <button onClick={capture}>Capture photo</button>
        {imgSrc && <img src={imgSrc} alt="" />}
      </>
    </div>
  );
}

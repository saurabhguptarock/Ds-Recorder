import { Component, Inject } from "@angular/core";
import { desktopCapturer, remote } from "electron";
import { writeFile } from "fs";
import { DOCUMENT } from "@angular/common";

const { dialog, Menu } = remote;
declare var MediaRecorder: any;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  videoSelectBtn;
  videoElement;
  mediaRecorder;
  startBtn;
  recordedChunks = [];

  constructor(@Inject(DOCUMENT) document) {
    this.startBtn = document.getElementById("startBtn");
    this.videoSelectBtn = document.getElementById("videoSelectBtn");
    this.videoElement = document.querySelector("video");
  }

  stopBtnClick() {
    this.mediaRecorder.stop();
    this.startBtn.classList.remove("btn-danger");
    this.startBtn.innerText = "Start";
  }
  startBtnClick() {
    this.mediaRecorder.start();
    this.startBtn.classList.add("btn-danger");
    this.startBtn.innerText = "Recording";
  }

  async getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
      types: ["window", "screen"]
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
      inputSources.map(source => {
        return {
          label: source.name,
          click: () => this.selectSource(source)
        };
      })
    );

    videoOptionsMenu.popup();
  }

  async selectSource(source: Electron.DesktopCapturerSource) {
    // this.videoSelectBtn.innerText = source.name;

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        // @ts-ignore
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: source.id
        }
      }
    };

    // @ts-ignore
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Preview the source in a video element
    document.querySelector("video").srcObject = stream;
    document.querySelector("video").play();

    // Create the Media Recorder
    const options = { mimeType: "video/webm; codecs=vp9" };
    this.mediaRecorder = new MediaRecorder(stream, options);

    // Register Event Handlers
    this.mediaRecorder.ondataavailable = this.handleDataAvailable;
    this.mediaRecorder.onstop = this.handleStop;

    // Updates the UI
  }

  // Captures all recorded chunks
  handleDataAvailable(e) {
    console.log("video data available");
    this.recordedChunks.push(e.data);
  }

  // Saves the video file on stop
  async handleStop(e) {
    const blob = new Blob(this.recordedChunks, {
      type: "video/webm; codecs=vp9"
    });
    //@ts-ignore
    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: "Save video",
      defaultPath: `vid-${Date.now()}.webm`
    });

    if (filePath) {
      writeFile(filePath, buffer, () =>
        console.log("video saved successfully!")
      );
    }
  }
}

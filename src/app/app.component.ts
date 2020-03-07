import { Component } from "@angular/core";
import { desktopCapturer, remote } from "electron";
import { from } from "rxjs";

const { dialog, Menu } = remote;
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "Ds Recorder";
}

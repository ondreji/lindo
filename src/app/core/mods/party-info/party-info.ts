import { Mods } from "../mods";
import { TranslateService } from "@ngx-translate/core";
import { Option } from "app/core/service/settings.service";
import { Logger } from "app/core/electron/logger.helper";

/**
 * This mod add the possibility to show party level and prospection count
 */
export class PartyInfo extends Mods {
  private partyInitialized:boolean;
  private container: any;

  constructor(
    wGame: any,
    private party_info: boolean,
    private translate: TranslateService
  ) {
    super(wGame);
    this.translate = translate;
    if (this.party_info) {
      Logger.info(' - enable PartyInfo');

      this.partyInitialized = (this.wGame.document.querySelector("#party-info-container") === null ? false : true);
      setTimeout(() => {this.updatePartyInfo()}, 100);
      this.on(this.wGame.dofus.connectionManager, 'PartyJoinMessage', this.updatePartyInfo.bind(this));
      this.on(this.wGame.dofus.connectionManager, 'PartyUpdateMessage', this.updatePartyInfo.bind(this));
      this.on(this.wGame.dofus.connectionManager, 'PartyMemberEjectedMessage', this.updatePartyInfo.bind(this));
      this.on(this.wGame.dofus.connectionManager, 'PartyMemberRemoveMessage', this.updatePartyInfo.bind(this));
      this.on(this.wGame.dofus.connectionManager, 'PartyNewMemberMessage', this.updatePartyInfo.bind(this));
      this.on(this.wGame.dofus.connectionManager, 'PartyUpdateMessage', this.updatePartyInfo.bind(this));
      this.on(this.wGame.dofus.connectionManager, 'PartyNewGuestMessage', this.updatePartyInfo.bind(this));
      this.on(this.wGame.dofus.connectionManager, 'PartyLeaderUpdateMessage', this.updatePartyInfo.bind(this));
    } else {
      Logger.info(' - enable PartyInfo');
    }
  }

  // Initialize party info container
  private initializePartyInfo() {
    if (this.partyInitialized)
      return;
    let partyBoxes = this.wGame.document.querySelector(".partyBoxes");
    if(!partyBoxes) return;
    let parent = partyBoxes.parentElement;
    this.container = this.wGame.document.createElement("div");
    this.container.style = `background: rgba(0, 0, 0, 0.6);
                            margin: 2px;
                            border-radius: 5px;
                            margin-bottom: 5px;
                            padding: 3px;
                            font-weight: bolder;
                            color: #ced0bb;
                            font-family: berlin_sans_fb_demibold;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 1) inset;`;
    let partyLevelElement = this.wGame.document.createElement("div");
    let prospectionContainerElement = this.wGame.document.createElement("div");
    let prospectionImageElement = this.wGame.document.createElement("img");
    let prospectionTextElement = this.wGame.document.createElement("span");

    this.container.id = "party-info-container";

    partyLevelElement.textContent = this.translate.instant('app.option.vip.party-info.level') + " ?";
    partyLevelElement.id = "party-level";
    partyLevelElement.style = "font-size: 13px;user-select: none;cursor: default;"

    prospectionContainerElement.style = "font-size: 13px;user-select: none;cursor: default;"

    prospectionImageElement.src = "./assets/ui/icons/prospecting.png";
    prospectionImageElement.style = "height: 1em; vertical-align: middle;"

    prospectionTextElement.textContent = " ?";
    prospectionTextElement.id = "party-pr";
    prospectionTextElement.style = "vertical-align: middle;"

    prospectionContainerElement.appendChild(prospectionImageElement);
    prospectionContainerElement.appendChild(prospectionTextElement);

    this.container.appendChild(partyLevelElement);
    this.container.appendChild(prospectionContainerElement);

    parent.insertBefore(this.container, partyBoxes);
    this.partyInitialized = true;
  }

  private destroy(){
    this.partyInitialized = false;
    if (this.container && this.container.parentElement) this.container.parentElement.removeChild(this.container);
  }

  // Update party data
  private updatePartyInfo() {
    if (!this.partyInitialized) {
      this.initializePartyInfo();
    }
    setTimeout(() => {
      try {
        var partyLevel = 0;
        var prospecting = 0;
        if (this.wGame.gui.party.currentParty && this.wGame.gui.party.currentParty._childrenList.length > 0) {
          this.wGame.gui.party.currentParty._childrenList.forEach((c) => {
            partyLevel += c.memberData.level;
            prospecting += c.memberData.prospecting;
          });
        this.wGame.document.querySelector("#party-level").textContent = this.translate.instant('app.option.vip.party-info.level') +" "+ (isNaN(partyLevel) ? "?" : partyLevel);
        this.wGame.document.querySelector("#party-pr").textContent = " "+ (isNaN(prospecting) ? "?":prospecting);
        }
      } catch(e) {}
    },(Math.random() * 500) + 500);
  }

  public reset() {
        super.reset();
        if (this.party_info) {
            this.destroy();
        }
    }
}

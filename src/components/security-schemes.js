import { LitElement, html } from 'lit-element'; 
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import marked from 'marked';

import FontStyles from '@/styles/font-styles';
import TableStyles from '@/styles/table-styles';
import InputStyles from '@/styles/input-styles';

export default class SecuritySchemes extends LitElement {
  render() {
    return html`
    ${FontStyles}
    ${TableStyles}
    ${InputStyles}
    <style>
      .url{
        display: inline-flex;
        color: #999;
        max-width: 220px;
        overflow-wrap: break-word;
        word-break: break-all;
      }
    </style>
    <div>AUTHENTICATION</div>
    <table style="width:auto" class="m-table">
      <tr>
        <th >Type </th>  
        <th> Authentication Procedure </th>  
      </tr>
      
        ${Object.keys(this.schemes).map(s => {
          const hasSecuritySpecValue = this.hasSecuritySpecValue(this.schemes[s].type, this.schemes[s].name, this.schemes[s].in);
          return html`
            <tr>  
            <td>
              <div style="font-weight:bold">${this.schemes[s].type}: ${this.schemes[s].scheme} 
              ${this.schemes[s].description?html`
                <div class="m-markdown"> 
                  ${unsafeHTML(marked(this.schemes[s].description || ""))}
                </div>`
              :''}
            </td>
            <td>
              ${this.schemes[s].type==='apiKey'?html`
                Send <code>'${this.schemes[s].name}'</code> in <code>'${this.schemes[s].in}'</code> with the given value
                <div class="${s}-class" data-type="${this.schemes[s].type}" data-in="${this.schemes[s].in}" data-name="${this.schemes[s].name}" data-inputname="${s}" style="margin:5px 0" spellcheck="false" >
                  <input type="text" name="${s}-token" style="width:202px;" placeholder="api-token" >

                <button 
                  class="m-btn"
                  name="${s}-button"
                  data-class="${s}-class"
                  data-action="${hasSecuritySpecValue?'CLEAR':'SET'}" 
                  @click="${this.dispatchChange}"
                >${hasSecuritySpecValue?'CLEAR':'SET'}</button>
              </div>
            `:``}
            ${this.schemes[s].type==='http' && this.schemes[s].scheme==='basic'?html`
              Send <code>'Authorization'</code> in header which will contains the word  <code>'Basic'</code> followed by a space and a base64-encoded string username:password.
              <div class="${s}-class" data-type="${this.schemes[s].type}" data-scheme="${this.schemes[s].scheme}" data-in="header" data-name="Authorization" data-inputname="${s}" style="margin:15px 0">
                <input type="text" name="${s}-username" style="width:100px;" placeholder="username" spellcheck="false">
                <input type="text" name="${s}-password" style="width:100px;" placeholder="password" spellcheck="false">
                <button 
                  class="m-btn"
                  name="${s}-button"
                  data-class="${s}-class"
                  data-action="${hasSecuritySpecValue?'CLEAR':'SET'}" 
                  @click="${this.dispatchChange}"
                >${hasSecuritySpecValue?'CLEAR':'SET'}</button>
              </div>
            `:``}
            ${this.schemes[s].type==='http' && this.schemes[s].scheme==='bearer'?html`
              Send <code>'Authorization'</code> in header which will contains the word  <code>'Bearer'</code> followed by a space and a Token String.
              <div class="${s}-class" data-type="${this.schemes[s].type}" data-scheme="${this.schemes[s].scheme}" data-in="header" data-name="Authorization" data-inputname="${s}" style="margin:15px 0">
                <input type="text" name="${s}-bearer-token" style="width:202px;" placeholder="bearer-token" spellcheck="false" >
                <button 
                  class="m-btn" 
                  name="${s}-button"
                  data-class="${s}-class"
                  data-action="${hasSecuritySpecValue?'CLEAR':'SET'}" 
                  @click="${this.dispatchChange}"
                >${hasSecuritySpecValue?'CLEAR':'SET'}</button>
              </div>
            `:``}
            ${this.schemes[s].type==='oauth2'?html`
              <div>
              ${Object.keys(this.schemes[s].flows).map(f => html`
                ${this.schemes[s].flows[f].authorizationUrl?html`<div><b>Auth URL:</b> <code class="url"> ${this.schemes[s].flows[f].authorizationUrl}</code></div>`:``}
                ${this.schemes[s].flows[f].tokenUrl?html`<div><b>Token URL:</b> <code class="url"> ${this.schemes[s].flows[f].tokenUrl}</code></div>`:``}
                ${this.schemes[s].flows[f].refreshUrl?html`<div><b>Refresh URL:</b> <code class="url"> ${this.schemes[s].flows[f].refreshUrl}</code></div>`:``}
                <div class="oauth" style="margin:5px 0">
                  <input type="text" name="${s}-client" style="width:100px;" placeholder="client-id" spellcheck="false" >
                  <input type="text" name="${s}-secret" style="width:100px;" placeholder="client-secret" spellcheck="false" >
                </div>
              `)}
              </div>
            `:``}
          </td>
          </tr>`
        }
      )}
    </table>`
  }

  static get properties() {
    return {
      schemes: {type: Object},
      selectedApiKeyName  : { type: String, attribute: 'selected-api-key-name' },
      selectedApiKeyValue : { type: String, attribute: 'selected-api-key-value' },
      securitySpecs: { type: Array, attribute: 'security-specs' }
    };

  }

  hasSecuritySpecValue(type, name, location) {
    return this.securitySpecs.findIndex(s => 
      s.keyLocation === location
      && s.keyName === name
      && s.keyType === type
      && s.keyValue !== ''
    ) > -1;
  }

  dispatchChange(e){
    let apiEl = e.target.closest(`.${e.target.dataset.class}`);
    if (!apiEl){
      return;
    }

    let keyType     = apiEl.dataset.type;
    let keyLocation = apiEl.dataset.in;
    let keyName     = apiEl.dataset.name;
    let inputname   = apiEl.dataset.inputname;
    let inputKeyValue="";

    
    if (e.target.dataset.action === "CLEAR"){
      //this.keyValue = "";
      let tokenEl = apiEl.querySelector(`input[name=${inputname}-token]`);

      if (tokenEl){
        tokenEl.value="";
      }
    }
    else{
      if (keyType==="apiKey"){
        // let tokenEl = apiEl.querySelector("input[name=token]");
        let tokenEl = apiEl.querySelector(`input[name=${inputname}-token]`);
        if (tokenEl){
          inputKeyValue = tokenEl.value;
          //this.keyValue = tokenEl.value;
        }

      }
      else if (keyType==="http"){
        let securityScheme=apiEl.dataset.scheme;
        if (securityScheme==="basic"){
          // let userNameEl = apiEl.querySelector("input[name=username]");
          // let passwordEl = apiEl.querySelector("input[name=password]");
          let userNameEl = apiEl.querySelector(`input[name=${inputname}-username]`);
          let passwordEl = apiEl.querySelector(`input[name=${inputname}-password]`);

          if (userNameEl && passwordEl){
            inputKeyValue = 'Basic '+ btoa(userNameEl.value+":"+passwordEl.value);
            // this.keyValue = 'Basic '+ btoa(userNameEl.value+":"+passwordEl.value);
          }
    
        }
        else if (securityScheme==="bearer"){
          // let tokenEl = apiEl.querySelector("input[name=token]");
          let tokenEl = apiEl.querySelector(`input[name=${inputname}-bearer-token]`);
          if (tokenEl){
             inputKeyValue = "Bearer " + tokenEl.value;
            // this.keyValue = "Bearer " + tokenEl.value;
          }
        }
      }
    }


    let event = new CustomEvent("change", {
      detail: {
        keyType:keyType,
        keyName:keyName,
        keyValue:inputKeyValue,
        keyLocation:keyLocation,
      }
    });
    this.dispatchEvent(event);
      
  }


}
// Register the element with the browser
customElements.define('security-schemes', SecuritySchemes);

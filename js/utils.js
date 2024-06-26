import designer from "./designer.js";

 export default class Utils {

  /**
   * Permets de récuperer le contenu d'un fichier du dossier "content"
   * @param {*} pageName le nom (avec l'extention) du fichier
   * @returns 
   */
  static async getContent(pageName) {
    let data = await this.get("/content/" + pageName);
    if (data == null) {
      data = await this.get("/portfolio/content/" + pageName);
    }
    return data;
  }

  /**
   * Meme principe que getContent, mais pour les composants
   * @param {*} componentName 
   * @returns 
   */
  static async getComponent(componentName) {
    let data = await this.get("/components/" + componentName);
    if (data == null) {
      data = await this.get("portfolio/components/" + componentName);
    }
    return data;
  }

  static async get(url) {
    try {
      const response = await fetch(url);
      const data = await response.text();
      return data;
    } catch (error) {
      designer.drawPopUp(
        "Erreur",
        "Impossible de charger le contenu : "+url+", veuillez réessayer plus tard."
      );
      return null;
    }
  }

 

  static setMaxContent() {
    const body = document.querySelector("body");
    if (document.querySelector(".container").scrollTop < 60) {
      if (body.classList.contains("max-content")) {
        body.classList.remove("max-content");
      }
  } else {
      body.classList.add("max-content");
  }
  }

  static lastEmailSent = 0;

  static async handleForm(formId) {



    if (this.lastEmailSent != 0 && Date.now() - this.lastEmailSent < 10000) {
      return {
        status: false,
        message: "Veuillez attendre 10 secondes avant de renvoyer un email"
      };
    }
    let form = document.querySelector(formId);
    let lname = form.querySelector("#lname").value;
    let fname = form.querySelector("#fname").value;
    let enterprise = form.querySelector("#enterprise").value;
    let email = form.querySelector("#from").value;
    let emailConf = form.querySelector("#emailConf").value;
    let message = form.querySelector("#message").value;
    let response;
    if (lname.length == 0 || fname.length == 0 || enterprise.length == 0 || email.length == 0 || message.length == 0) {
      response = {
        status: false,
        message: "Veuillez remplir tous les champs du formulaire"
      }
      console.log(response);
      return response;
    }
    if (email != emailConf) {
      response =  {
        status: false,
        message: "Les adresses email ne correspondent pas"
      }
      console.log(response);
      return response;
    }
    if (!email.includes("@") || !email.includes(".")) {
      response =  {
        status: false,
        message: "Veuillez entrer une adresse email valide"
      }
      console.log(response);
      return response;
    }

    emailjs.init({
      publicKey: 'Y1W6sMtCwBydZwWDc',
      blockHeadless: true,
      limitRate: {
        id: 'app',
        throttle: 1000,
      },
    });

    try {
      const result = await emailjs.sendForm('service_eku2fls', 'template_1n1gusl', formId);
      this.lastEmailSent = Date.now();
      response = {
          status: true,
          message: "Email envoyé !"
      };
      return response;
  } catch (error) {
      response = {
          status: false,
          message: "Une erreur s'est produite durant l'envoi, veuillez réessayer plus tard."
      };
      return response;
  }
  }

  
  /**
   * permet de determiner un element html est affiché sur l'ecran
   * @param {*} element
   * @returns un boulean indiquand si l'element est affiché
   */
  static isOnScreen(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    return rect.bottom <= windowHeight + rect.height - 200;
  }

  /**
       * permet de faire une animation pour afficher un element à l'ecran, selon si il est censé etre affiché
       * Pour cela, ajoute la classe visible quand necessaire
       * @param {*} element
       */
  static appearsOnScroll(element) {
    if (this.isOnScreen(element) && !element.classList.contains("visible")) {
      element.classList.add("visible");
    }
  }

  static makeImgClickable() {
    const img = document.querySelectorAll("img");
    img.forEach(element => {
      element.addEventListener("click", () => {
        designer.drawFullImg(element.src);
    });
      
    });

  }

  static setupMoreButton() {
    const moreButton = document.querySelector(".more-btn");
    if (moreButton) {
      moreButton.addEventListener("click", () => {
        const content = document.querySelector(".container");
        content.scrollTop = 200;
        console.log("scrolling");
      });
    }
  }

  /**
   * Permets de rechercher dans tous les documents contenus dans content/ un certain nombre de mots
   * @param {*} input une liste de mots a rechercher
   * @returns une liste de resultat, ou result.page correspond a la page, et result.elem correspond à l'element de resultat parsé de md à json
   */
  static async search(input) {
    const result = []
    const pages = ["competences", "experiences", "projets"];
    for (const page of pages) {
      let data = await this.getContent(page+".md")
      data = this.parseMarkdown(data);

      data.forEach(element => {

        let containsInput = false;
        
        if (element.title.toLowerCase().includes(input) || (element.summary && element.summary.toLowerCase().includes(input))){
          containsInput = true;

        } else {

          element.tags.forEach(tag => {
            if (tag.toLowerCase().includes(input)) {
              containsInput = true;
            }
          });

          if (!containsInput) {
            element.content.forEach(content => {
              if (content.type == "text" && content.data.toLowerCase().includes(input)){
                containsInput = true;
              }
            });
          }
        }
        if (containsInput) {
          result.push({
            page: page,
            elem: element
          })
        }
      });
    }
      
    return result;
  }

  /**
   * Pemrets de convertir un fichier markdown au format json
   * @param {*} markdown 
   * @returns 
   */
  static parseMarkdown(markdown) {
    const lines = markdown.split("\n");
    const sections = [];
    let currentSection = null;
    let currentParagraph = [];

    lines.forEach((line) => {
      line = line.trim();

      if (line.startsWith("# ")) {
        if (currentSection) {
          if (currentParagraph.length > 0) {
            currentSection.content.push({
              type: "text",
              data: currentParagraph.join(" "),
            });
            currentParagraph = [];
          }
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace("# ", ""),
          tags: [],
          content: [],
          summary: "",
        };
      } else if (line.startsWith("* ")) {
        if (currentSection) {
          currentSection.tags.push(line.replace("* ", ""));
        }
      } else if (line.startsWith("![")) {
        const imageMatch = line.match(/!\[.*?\]\((.*?)\)/);
        if (imageMatch && currentSection) {
          currentSection.content.push({
            type: "img",
            data: imageMatch[1].replace("../img/", ""),
          });
        }
      } else if (line.includes("_") || line.includes("*")) {
        const summaryMatch = line.match(/(?:\*|_)([^*_]+)(?:\*|_)/);
        if (summaryMatch && currentSection) {
          currentSection.summary = summaryMatch[1];
        }
      } else if (line) {
        currentParagraph.push(line);
      } else if (currentParagraph.length > 0) {
        if (currentSection) {
          currentSection.content.push({
            type: "text",
            data: currentParagraph.join(" "),
          });
          currentParagraph = [];
        }
      }
    });

    if (currentSection) {
      if (currentParagraph.length > 0) {
        currentSection.content.push({
          type: "text",
          data: currentParagraph.join(" "),
        });
      }
      sections.push(currentSection);
    }

    return sections;
  }
}


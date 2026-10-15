export interface HowToData {
  name: string;
  description: string;
  toolName: string;
  steps: {
    name: string;
    text: string;
    anchor: string;
  }[];
}

const extractZipData: Record<string, HowToData> = {
  en: {
    name: "How to Extract ZIP Files Online",
    description: "Step-by-step documentation for extracting ZIP files online. Covers drag-and-drop loading, file preview, selective extraction, privacy architecture, and supported formats.",
    toolName: "Web Browser",
    steps: [
      {
        name: "Load a ZIP File",
        text: "Drag and drop a .zip file from your local disk into the browser window, or click the dropzone to select a file from your device.",
        anchor: "#loading-a-file"
      },
      {
        name: "Navigate the File Tree",
        text: "Browse the archive's internal directory structure, collapsible folders, and file entries in the sidebar.",
        anchor: "#file-tree"
      },
      {
        name: "Preview Files Before Download",
        text: "Click any supported file (images, PDFs, text, code, audio, PSD) to decompress and preview it directly in your browser.",
        anchor: "#previewing-files"
      },
      {
        name: "Selective Extraction",
        text: "Download individual files or specific folders without having to decompress the entire archive.",
        anchor: "#selective-extraction"
      },
      {
        name: "Password-Protected Archives",
        text: "If the archive is encrypted, enter the password when prompted for on-device local decryption in browser memory.",
        anchor: "#password-protected"
      }
    ]
  },
  es: {
    name: "Cómo Extraer Archivos ZIP Online",
    description: "Documentación paso a paso para extraer archivos ZIP online. Cubre la carga mediante arrastrar y soltar, vista previa de archivos, extracción selectiva, arquitectura de privacidad y formatos compatibles.",
    toolName: "Navegador Web",
    steps: [
      {
        name: "Cargar un Archivo ZIP",
        text: "Arrastra y suelta un archivo .zip en la ventana del navegador o haz clic en la zona de selección para elegir un archivo de tu dispositivo.",
        anchor: "#loading-a-file"
      },
      {
        name: "Navegar por el Árbol de Archivos",
        text: "Explora la estructura interna del archivo con carpetas desplegables y archivos en la barra lateral.",
        anchor: "#file-tree"
      },
      {
        name: "Vista Previa de Archivos Antes de Descargar",
        text: "Haz clic en cualquier archivo compatible para descomprimirlo y previsualizarlo directamente en el navegador.",
        anchor: "#previewing-files"
      },
      {
        name: "Extracción Selectiva",
        text: "Descarga archivos individuales o carpetas específicas sin tener que descomprimir todo el archivo.",
        anchor: "#selective-extraction"
      },
      {
        name: "Archivos Protegidos con Contraseña",
        text: "Si el archivo está cifrado, introduce la contraseña cuando se te solicite para el descifrado local en el navegador.",
        anchor: "#password-protected"
      }
    ]
  },
  fr: {
    name: "Comment Extraire des Fichiers ZIP en Ligne",
    description: "Documentation étape par étape pour extraire des fichiers ZIP en ligne. Chargement par glisser-déposer, prévisualisation, extraction sélective et sécurité.",
    toolName: "Navigateur Web",
    steps: [
      {
        name: "Charger un Fichier ZIP",
        text: "Glissez-déposez un fichier .zip dans le navigateur ou cliquez pour parcourir les fichiers de votre appareil.",
        anchor: "#loading-a-file"
      },
      {
        name: "Naviguer dans l'Arborescence",
        text: "Explorez la structure interne de l'archive avec dossiers pliables et entrées de fichiers dans le panneau latéral.",
        anchor: "#file-tree"
      },
      {
        name: "Prévisualiser les Fichiers Avant Téléchargement",
        text: "Cliquez sur n'importe quel fichier compatible pour le décompresser et le prévisualiser directement dans le navigateur.",
        anchor: "#previewing-files"
      },
      {
        name: "Extraction Sélective",
        text: "Téléchargez des fichiers individuels ou des dossiers spécifiques sans décompresser toute l'archive.",
        anchor: "#selective-extraction"
      },
      {
        name: "Archives Protégées par Mot de Passe",
        text: "Si l'archive est chiffrée, entrez le mot de passe pour un déchiffrement local et sécurisé dans la mémoire du navigateur.",
        anchor: "#password-protected"
      }
    ]
  },
  de: {
    name: "So Entpacken Sie ZIP-Dateien Online",
    description: "Schritt-für-Schritt-Anleitung zum Online-Entpacken von ZIP-Dateien. Drag-and-Drop-Laden, Dateivorschau, selektive Extraktion und Datenschutz.",
    toolName: "Webbrowser",
    steps: [
      {
        name: "ZIP-Datei Laden",
        text: "Ziehen Sie eine .zip-Datei per Drag-and-Drop in den Browser oder wählen Sie eine Datei von Ihrem Gerät aus.",
        anchor: "#loading-a-file"
      },
      {
        name: "Dateibaum Navigieren",
        text: "Durchsuchen Sie die interne Ordner- und Dateihierarchie in der einklappbaren Seitenleiste.",
        anchor: "#file-tree"
      },
      {
        name: "Dateivorschau vor dem Download",
        text: "Klicken Sie auf eine unterstützte Datei, um sie direkt im Browser zu entpacken und anzuzeigen.",
        anchor: "#previewing-files"
      },
      {
        name: "Selektive Extraktion",
        text: "Laden Sie einzelne Dateien oder bestimmte Ordner herunter, ohne das gesamte Archiv entpacken zu müssen.",
        anchor: "#selective-extraction"
      },
      {
        name: "Passwortgeschützte Archive",
        text: "Geben Sie bei verschlüsselten Archiven das Passwort ein, um die lokale Entschlüsselung im Browser durchzuführen.",
        anchor: "#password-protected"
      }
    ]
  },
  it: {
    name: "Come Estrarre File ZIP Online",
    description: "Guida passo passo per estrarre file ZIP online. Caricamento tramite trascinamento, anteprima dei file, estrazione selettiva e privacy.",
    toolName: "Browser Web",
    steps: [
      {
        name: "Caricare un File ZIP",
        text: "Trascina e rilascia un file .zip nella finestra del browser o fai clic per selezionare un file dal tuo dispositivo.",
        anchor: "#loading-a-file"
      },
      {
        name: "Navigare nell'Albero dei File",
        text: "Esplora la struttura gerarchica interna di cartelle e file nella barra laterale comprimibile.",
        anchor: "#file-tree"
      },
      {
        name: "Anteprima dei File Prima del Download",
        text: "Fai clic su qualsiasi file supportato per decomprimerlo e visualizzarlo in anteprima direttamente nel browser.",
        anchor: "#previewing-files"
      },
      {
        name: "Estrazione Selettiva",
        text: "Scarica singoli file o cartelle specifiche senza dover estrarre l'intero archivio.",
        anchor: "#selective-extraction"
      },
      {
        name: "Archivi Protetti da Password",
        text: "Se l'archivio è crittografato, inserisci la password quando richiesto per la decrittografia locale nel browser.",
        anchor: "#password-protected"
      }
    ]
  },
  ja: {
    name: "オンラインでZIPファイルを解凍する方法",
    description: "オンラインでZIPファイルを解凍するためのステップバイステップガイド。ドラッグ＆ドロップ、プレビュー、個別抽出、セキュリティ。",
    toolName: "ウェブブラウザ",
    steps: [
      {
        name: "ZIPファイルの読み込み",
        text: "ZIPファイルをブラウザウィンドウにドラッグ＆ドロップするか、クリックして端末からファイルを選択します。",
        anchor: "#loading-a-file"
      },
      {
        name: "ファイルツリーの確認",
        text: "サイドバーの折りたたみ可能なファイルツリーでアーカイブ内のディレクトリ構造とファイルを確認します。",
        anchor: "#file-tree"
      },
      {
        name: "ダウンロード前のファイルプレビュー",
        text: "対応ファイルをクリックして、ダウンロードすることなくブラウザ内で直接解凍・プレビューします。",
        anchor: "#previewing-files"
      },
      {
        name: "個別ファイルの選択抽出",
        text: "アーカイブ全体を解凍することなく、必要なファイルやフォルダだけを選択してダウンロードします。",
        anchor: "#selective-extraction"
      },
      {
        name: "パスワード保護されたアーカイブの解除",
        text: "暗号化されたアーカイブの場合は、パスワードを入力してブラウザメモリ内で安全に復号します。",
        anchor: "#password-protected"
      }
    ]
  },
  ko: {
    name: "온라인으로 ZIP 파일 압축 푸는 방법",
    description: "온라인으로 ZIP 파일의 압축을 해제하기 위한 단계별 가이드. 드래그 앤 드롭 로딩, 파일 미리보기, 선택적 추출 및 개인정보 보호.",
    toolName: "웹 브라우저",
    steps: [
      {
        name: "ZIP 파일 불러오기",
        text: "로컬 디스크에서 .zip 파일을 브라우저 창으로 드래그 앤 드롭하거나 클릭하여 파일을 선택합니다.",
        anchor: "#loading-a-file"
      },
      {
        name: "파일 트리 탐색",
        text: "사이드바에서 접고 펼칠 수 있는 아카이브 내부 폴더 및 파일 구조를 탐색합니다.",
        anchor: "#file-tree"
      },
      {
        name: "다운로드 전 파일 미리보기",
        text: "지원되는 파일을 클릭하여 다운로드 없이 브라우저에서 바로 압축을 풀고 미리 확인합니다.",
        anchor: "#previewing-files"
      },
      {
        name: "선택적 압축 해제",
        text: "전체 아카이브를 풀지 않고 원하는 개별 파일이나 폴더만 선택하여 다운로드합니다.",
        anchor: "#selective-extraction"
      },
      {
        name: "비밀번호로 보호된 아카이브 복호화",
        text: "암호화된 아카이브인 경우 비밀번호를 입력하여 브라우저 내에서 안전하게 로컬 복호화합니다.",
        anchor: "#password-protected"
      }
    ]
  },
  pt: {
    name: "Como Extrair Arquivos ZIP Online",
    description: "Documentação passo a passo para extrair arquivos ZIP online. Carregamento por arrastar e soltar, pré-visualização, extração seletiva e privacidade.",
    toolName: "Navegador Web",
    steps: [
      {
        name: "Carregar um Arquivo ZIP",
        text: "Arraste e solte um arquivo .zip na janela do navegador ou clique para selecionar um arquivo do seu dispositivo.",
        anchor: "#loading-a-file"
      },
      {
        name: "Navegar na Árvore de Arquivos",
        text: "Explore a hierarquia interna de pastas e arquivos no painel lateral recolhível.",
        anchor: "#file-tree"
      },
      {
        name: "Pré-visualizar Arquivos Antes de Baixar",
        text: "Clique em qualquer arquivo compatível para descompactá-lo e visualizá-lo diretamente no navegador.",
        anchor: "#previewing-files"
      },
      {
        name: "Extração Seletiva",
        text: "Baixe arquivos individuais ou pastas específicas sem precisar descompactar todo o arquivo.",
        anchor: "#selective-extraction"
      },
      {
        name: "Arquivos Protegidos por Senha",
        text: "Se o arquivo for criptografado, insira a senha quando solicitado para descriptografia local no navegador.",
        anchor: "#password-protected"
      }
    ]
  }
};

const createZipData: Record<string, HowToData> = {
  en: {
    name: "How to Create ZIP Files Online",
    description: "Step-by-step documentation for creating ZIP files online. Covers file selection, compression levels, AES password encryption, and our local-processing privacy architecture.",
    toolName: "Web Browser",
    steps: [
      {
        name: "Add Files and Folders",
        text: "Drag and drop files or folders into the application window, or click browse to select files from your local storage.",
        anchor: "#adding-files"
      },
      {
        name: "Configure Compression Levels",
        text: "Select your preferred compression level between fast processing and maximum file size reduction.",
        anchor: "#compression-levels"
      },
      {
        name: "Set Password Encryption (Optional)",
        text: "Optionally enter a password to encrypt your files using robust AES encryption before bundling.",
        anchor: "#password-encryption"
      },
      {
        name: "Generate and Download Archive",
        text: "Click generate to compress files locally in your browser memory and download the resulting .zip archive immediately.",
        anchor: "#generating"
      }
    ]
  },
  es: {
    name: "Cómo Crear Archivos ZIP Online",
    description: "Documentación paso a paso para crear archivos ZIP online. Cubre la selección de archivos, niveles de compresión, cifrado de contraseñas AES y privacidad local.",
    toolName: "Navegador Web",
    steps: [
      {
        name: "Añadir Archivos y Carpetas",
        text: "Arrastra y suelta archivos o carpetas en la aplicación, o haz clic en examinar para seleccionarlos de tu dispositivo.",
        anchor: "#adding-files"
      },
      {
        name: "Configurar Niveles de Compresión",
        text: "Elige tu nivel de compresión preferido entre velocidad rápida o máxima reducción de tamaño.",
        anchor: "#compression-levels"
      },
      {
        name: "Establecer Contraseña y Cifrado",
        text: "Ingresa opcionalmente una contraseña para proteger tus archivos mediante cifrado AES antes de agruparlos.",
        anchor: "#password-encryption"
      },
      {
        name: "Generar y Descargar Archivo",
        text: "Haz clic en generar para comprimir los archivos localmente en el navegador y descarga el archivo .zip de inmediato.",
        anchor: "#generating"
      }
    ]
  },
  fr: {
    name: "Comment Créer des Fichiers ZIP en Ligne",
    description: "Documentation étape par étape pour créer des fichiers ZIP en ligne. Sélection de fichiers, niveaux de compression, chiffrement AES et confidentialité locale.",
    toolName: "Navigateur Web",
    steps: [
      {
        name: "Ajouter des Fichiers et Dossiers",
        text: "Glissez-déposez des fichiers ou dossiers dans l'application, ou parcourez votre appareil pour les sélectionner.",
        anchor: "#adding-files"
      },
      {
        name: "Configurer les Niveaux de Compression",
        text: "Sélectionnez votre niveau de compression entre traitement rapide et réduction maximale de taille.",
        anchor: "#compression-levels"
      },
      {
        name: "Définir un Mot de Passe (Chiffrement)",
        text: "Entrez un mot de passe optionnel pour sécuriser vos fichiers avec un chiffrement AES robuste.",
        anchor: "#password-encryption"
      },
      {
        name: "Générer et Télécharger l'Archive",
        text: "Cliquez sur générer pour compresser localement dans votre navigateur et téléchargez immédiatement votre fichier .zip.",
        anchor: "#generating"
      }
    ]
  },
  de: {
    name: "So Erstellen Sie ZIP-Dateien Online",
    description: "Schritt-für-Schritt-Anleitung zur Online-Erstellung von ZIP-Dateien. Dateiauswahl, Komprimierungsstufen, AES-Passwortverschlüsselung und lokale Verarbeitung.",
    toolName: "Webbrowser",
    steps: [
      {
        name: "Dateien und Ordner Hinzufügen",
        text: "Ziehen Sie Dateien oder Ordner per Drag-and-Drop in die Anwendung oder wählen Sie sie von Ihrem Gerät aus.",
        anchor: "#adding-files"
      },
      {
        name: "Komprimierungsstufen Konfigurieren",
        text: "Wählen Sie Ihre bevorzugte Komprimierungsstufe zwischen schneller Erstellung und maximaler Dateigrößenreduzierung.",
        anchor: "#compression-levels"
      },
      {
        name: "Passwortverschlüsselung Einrichten",
        text: "Geben Sie optional ein Passwort ein, um Ihre Dateien mit sicherer AES-Verschlüsselung zu schützen.",
        anchor: "#password-encryption"
      },
      {
        name: "Archiv Generieren und Herunterladen",
        text: "Klicken Sie auf Generieren, um die Dateien lokal im Browser zu komprimieren und laden Sie die .zip-Datei herunter.",
        anchor: "#generating"
      }
    ]
  },
  it: {
    name: "Come Creare File ZIP Online",
    description: "Guida passo passo per creare file ZIP online. Selezione dei file, livelli di compressione, crittografia con password AES e privacy locale.",
    toolName: "Browser Web",
    steps: [
      {
        name: "Aggiungere File e Cartelle",
        text: "Trascina e rilascia file o cartelle nell'applicazione o fai clic su sfoglia per selezionarli dal dispositivo.",
        anchor: "#adding-files"
      },
      {
        name: "Configurare i Livelli di Compressione",
        text: "Seleziona il livello di compressione desiderato tra elaborazione veloce e massima riduzione delle dimensioni.",
        anchor: "#compression-levels"
      },
      {
        name: "Impostare Password e Crittografia",
        text: "Inserisci facoltativamente una password per proteggere i tuoi file tramite crittografia avanzata AES.",
        anchor: "#password-encryption"
      },
      {
        name: "Generare e Scaricare l'Archivio",
        text: "Fai clic su genera per comprimere i file localmente nella memoria del browser e scarica subito l'archivio .zip.",
        anchor: "#generating"
      }
    ]
  },
  ja: {
    name: "オンラインでZIPファイルを作成する方法",
    description: "オンラインでZIPファイルを作成するためのステップバイステップガイド。ファイル選択、圧縮レベル、AESパスワード暗号化、ローカル処理。",
    toolName: "ウェブブラウザ",
    steps: [
      {
        name: "ファイルやフォルダの追加",
        text: "ファイルやフォルダをアプリケーションにドラッグ＆ドロップするか、参照ボタンをクリックして選択します。",
        anchor: "#adding-files"
      },
      {
        name: "圧縮レベルの設定",
        text: "高速処理または最大ファイルサイズ削減の中から希望の圧縮レベルを設定します。",
        anchor: "#compression-levels"
      },
      {
        name: "パスワード暗号化の設定（任意）",
        text: "必要に応じてパスワードを入力し、安全なAES暗号化でファイルを保護します。",
        anchor: "#password-encryption"
      },
      {
        name: "アーカイブの生成とダウンロード",
        text: "生成ボタンをクリックしてブラウザ内でファイルを圧縮し、完成した.zipアーカイブを即座にダウンロードします。",
        anchor: "#generating"
      }
    ]
  },
  ko: {
    name: "온라인으로 ZIP 파일을 생성하는 방법",
    description: "온라인으로 ZIP 파일을 만들기 위한 단계별 가이드. 파일 선택, 압축 레벨, AES 비밀번호 암호화 및 로컬 처리 방식 안내.",
    toolName: "웹 브라우저",
    steps: [
      {
        name: "파일 및 폴더 추가",
        text: "파일이나 폴더를 브라우저 창으로 드래그 앤 드롭하거나 찾아보기 버튼을 통해 압축할 항목을 추가합니다.",
        anchor: "#adding-files"
      },
      {
        name: "압축 레벨 설정",
        text: "빠른 처리 속도와 최대 용량 절감 중 원하는 압축 레벨을 선택합니다.",
        anchor: "#compression-levels"
      },
      {
        name: "비밀번호 및 암호화 설정",
        text: "필요에 따라 비밀번호를 입력하여 안전한 AES 암호화로 아카이브를 보호합니다.",
        anchor: "#password-encryption"
      },
      {
        name: "아카이브 생성 및 다운로드",
        text: "생성 버튼을 클릭하여 브라우저 내에서 직접 압축을 완료하고 .zip 아카이브를 즉시 다운로드합니다.",
        anchor: "#generating"
      }
    ]
  },
  pt: {
    name: "Como Criar Arquivos ZIP Online",
    description: "Documentação passo a passo para criar arquivos ZIP online. Seleção de arquivos, níveis de compressão, criptografia AES com senha e privacidade local.",
    toolName: "Navegador Web",
    steps: [
      {
        name: "Adicionar Arquivos e Pastas",
        text: "Arraste e solte arquivos ou pastas na janela do aplicativo ou clique para selecioná-los do seu dispositivo.",
        anchor: "#adding-files"
      },
      {
        name: "Configurar Níveis de Compactação",
        text: "Escolha entre processamento rápido ou máxima redução do tamanho do arquivo.",
        anchor: "#compression-levels"
      },
      {
        name: "Definir Senha e Criptografia",
        text: "Insira opcionalmente uma senha para criptografar seus arquivos usando AES antes de empacotá-los.",
        anchor: "#password-encryption"
      },
      {
        name: "Gerar e Baixar o Arquivo",
        text: "Clique no botão gerar para compactar os arquivos no navegador e baixe o arquivo .zip resultante imediatamente.",
        anchor: "#generating"
      }
    ]
  }
};

export function getExtractZipHowToSchema(pageUrl: string, locale: string = 'en') {
  const data = extractZipData[locale] || extractZipData.en;
  const baseUrl = pageUrl.split('#')[0];
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": data.name,
    "description": data.description,
    "inLanguage": locale,
    "totalTime": "PT1M",
    "tool": [
      {
        "@type": "HowToTool",
        "name": data.toolName
      }
    ],
    "step": data.steps.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "name": step.name,
      "text": step.text,
      "url": `${baseUrl}${step.anchor}`
    }))
  };
}

export function getCreateZipHowToSchema(pageUrl: string, locale: string = 'en') {
  const data = createZipData[locale] || createZipData.en;
  const baseUrl = pageUrl.split('#')[0];
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": data.name,
    "description": data.description,
    "inLanguage": locale,
    "totalTime": "PT1M",
    "tool": [
      {
        "@type": "HowToTool",
        "name": data.toolName
      }
    ],
    "step": data.steps.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "name": step.name,
      "text": step.text,
      "url": `${baseUrl}${step.anchor}`
    }))
  };
}

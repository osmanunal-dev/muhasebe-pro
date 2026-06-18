// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkx5rwdhmQMhyjSCs4sq_BvYV1-ihgh64",
  authDomain: "muhasebe-pro-6e8a0.firebaseapp.com",
  projectId: "muhasebe-pro-6e8a0",
  storageBucket: "muhasebe-pro-6e8a0.firebasestorage.app",
  messagingSenderId: "412057938716",
  appId: "1:412057938716:web:48a287c6875c6f75a228d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Tüm cihazların paylaştığı tek çalışma alanı. İsterseniz bu metni
// kendi belirlediğiniz gizli bir kelimeyle değiştirebilirsiniz; tüm
// bilgisayarlarda AYNI olmalıdır.
const cloudWorkspaceId = "ortak-calisma-alani";
const cloudCollection = "muhasebePro";

const storeKey = "muhasebe-pro-data";
const sessionKey = "muhasebe-pro-session";
const defaultBulkDebtMessageTemplate =
  "Sayın {cari}, kayıtlarımızda {tutar} tutarında bekleyen borcunuz görünmektedir. Uygun olduğunuzda ödeme durumuyla ilgili bilgi rica ederiz. Teşekkürler.";

const seedData = {
  customers: [
    {
      id: crypto.randomUUID(),
      code: "120.01.0001",
      kind: "customer",
      name: "Akdeniz Teknoloji A.Ş.",
      email: "finans@akdeniz.test",
      countryCode: "+90",
      phone: "0212 000 00 01",
      tax: "1234567890",
      taxOffice: "Büyük Mükellefler",
    },
    {
      id: crypto.randomUUID(),
      code: "320.01.0001",
      kind: "supplier",
      name: "Mavi Ofis Ltd.",
      email: "muhasebe@maviofis.test",
      countryCode: "+90",
      phone: "0312 000 00 02",
      tax: "9876543210",
      taxOffice: "Çankaya",
    },
  ],
  products: [
    {
      id: crypto.randomUUID(),
      code: "STK-0001",
      name: "Danışmanlık Hizmeti",
      cost: 10000,
      margin: 25,
      price: 12500,
      unit: "Hizmet",
      stock: 0,
    },
    {
      id: crypto.randomUUID(),
      code: "STK-0002",
      name: "Aylık Yazılım Lisansı",
      cost: 2000,
      margin: 20,
      price: 2400,
      unit: "Adet",
      stock: 40,
    },
  ],
  invoices: [],
  quotes: [],
  expenses: [],
  receipts: [],
  debts: [],
  tracking: [],
  bankAccounts: [],
  widgets: {
    todos: [],
    calendar: [],
  },
  messageTemplates: {
    debtBulk: defaultBulkDebtMessageTemplate,
  },
  company: {
    logo: "",
    name: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    tax: "",
    taxOffice: "",
  },
  users: [],
};

let data = loadData();
let editingInvoiceId = null;
let editingQuoteId = null;
let editingExpenseId = null;
let editingCustomerId = null;
let editingProductId = null;
let editingReceiptId = null;
let editingTrackingId = null;
let editingDebtId = null;
let editingBankId = null;
let editingUserId = null;
let bulkProductEditMode = false;
let pendingWhatsappPhone = "";
let pendingWhatsappRecipients = [];
let pendingWhatsappIndex = 0;
let pendingWhatsappTemplate = "";
let pendingQuoteScreenshot = "";
let pendingCustomerTarget = "";
let ratesLoaded = false;
const selectedDebtIds = new Set();
const tablePageSize = 20;
const tablePages = {
  invoices: 1,
  quotes: 1,
  expenses: 1,
  customers: 1,
  tracking: 1,
  products: 1,
  receipts: 1,
};

const els = {
  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginUsername: document.querySelector("#loginUsername"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  appShell: document.querySelector("#appShell"),
  sessionUser: document.querySelector("#sessionUser"),
  logoutBtn: document.querySelector("#logoutBtn"),
  nav: document.querySelector("#nav"),
  pageTitle: document.querySelector("#pageTitle"),
  views: document.querySelectorAll(".view"),
  totalSales: document.querySelector("#totalSales"),
  totalExpenses: document.querySelector("#totalExpenses"),
  netBalance: document.querySelector("#netBalance"),
  pendingAmount: document.querySelector("#pendingAmount"),
  currentMonth: document.querySelector("#currentMonth"),
  flowChart: document.querySelector("#flowChart"),
  activityList: document.querySelector("#activityList"),
  invoiceForm: document.querySelector("#invoiceForm"),
  invoiceFormDialog: document.querySelector("#invoiceFormDialog"),
  invoiceFormTitle: document.querySelector("#invoiceFormTitle"),
  invoiceCustomer: document.querySelector("#invoiceCustomer"),
  invoiceType: document.querySelector("#invoiceType"),
  invoiceNumber: document.querySelector("#invoiceNumber"),
  invoiceDate: document.querySelector("#invoiceDate"),
  invoiceDue: document.querySelector("#invoiceDue"),
  invoiceProductCode: document.querySelector("#invoiceProductCode"),
  invoiceProduct: document.querySelector("#invoiceProduct"),
  invoiceQty: document.querySelector("#invoiceQty"),
  invoiceUnit: document.querySelector("#invoiceUnit"),
  invoiceVat: document.querySelector("#invoiceVat"),
  invoiceLinePrice: document.querySelector("#invoiceLinePrice"),
  invoiceLineTotal: document.querySelector("#invoiceLineTotal"),
  invoiceGlobalVat: document.querySelector("#invoiceGlobalVat"),
  invoiceStatus: document.querySelector("#invoiceStatus"),
  invoiceNote: document.querySelector("#invoiceNote"),
  invoiceLines: document.querySelector("#invoiceLines"),
  addInvoiceLineBtn: document.querySelector("#addInvoiceLineBtn"),
  invoiceSubtotalPreview: document.querySelector("#invoiceSubtotalPreview"),
  invoiceVatPreview: document.querySelector("#invoiceVatPreview"),
  invoiceTotalPreview: document.querySelector("#invoiceTotalPreview"),
  invoiceSaveBtn: document.querySelector("#invoiceSaveBtn"),
  productCodeList: document.querySelector("#productCodeList"),
  productDescriptionList: document.querySelector("#productDescriptionList"),
  invoiceSearch: document.querySelector("#invoiceSearch"),
  addInvoiceCustomerBtn: document.querySelector("#addInvoiceCustomerBtn"),
  invoiceCsvInput: document.querySelector("#invoiceCsvInput"),
  sampleInvoiceCsvBtn: document.querySelector("#sampleInvoiceCsvBtn"),
  invoiceTable: document.querySelector("#invoiceTable"),
  invoicePagination: document.querySelector("#invoicePagination"),
  quoteForm: document.querySelector("#quoteForm"),
  quoteFormDialog: document.querySelector("#quoteFormDialog"),
  quoteFormTitle: document.querySelector("#quoteFormTitle"),
  quoteNumber: document.querySelector("#quoteNumber"),
  quoteCustomer: document.querySelector("#quoteCustomer"),
  quoteDate: document.querySelector("#quoteDate"),
  quoteValidUntil: document.querySelector("#quoteValidUntil"),
  quoteStatus: document.querySelector("#quoteStatus"),
  quoteLines: document.querySelector("#quoteLines"),
  quoteNote: document.querySelector("#quoteNote"),
  quoteScreenshotInput: document.querySelector("#quoteScreenshotInput"),
  quoteScreenshotPreview: document.querySelector("#quoteScreenshotPreview"),
  removeQuoteScreenshotBtn: document.querySelector("#removeQuoteScreenshotBtn"),
  addQuoteLineBtn: document.querySelector("#addQuoteLineBtn"),
  quoteSubtotalPreview: document.querySelector("#quoteSubtotalPreview"),
  quoteVatPreview: document.querySelector("#quoteVatPreview"),
  quoteTotalPreview: document.querySelector("#quoteTotalPreview"),
  quoteSaveBtn: document.querySelector("#quoteSaveBtn"),
  quoteSearch: document.querySelector("#quoteSearch"),
  addQuoteCustomerBtn: document.querySelector("#addQuoteCustomerBtn"),
  quoteTable: document.querySelector("#quoteTable"),
  quotePagination: document.querySelector("#quotePagination"),
  expenseForm: document.querySelector("#expenseForm"),
  expenseFormDialog: document.querySelector("#expenseFormDialog"),
  expenseFormTitle: document.querySelector("#expenseFormTitle"),
  expenseTitle: document.querySelector("#expenseTitle"),
  expenseDate: document.querySelector("#expenseDate"),
  expenseCategory: document.querySelector("#expenseCategory"),
  expenseStatus: document.querySelector("#expenseStatus"),
  expenseNote: document.querySelector("#expenseNote"),
  expenseLines: document.querySelector("#expenseLines"),
  addExpenseLineBtn: document.querySelector("#addExpenseLineBtn"),
  expenseSubtotalPreview: document.querySelector("#expenseSubtotalPreview"),
  expenseVatPreview: document.querySelector("#expenseVatPreview"),
  expenseTotalPreview: document.querySelector("#expenseTotalPreview"),
  expenseAmount: document.querySelector("#expenseAmount"),
  expenseSaveBtn: document.querySelector("#expenseSaveBtn"),
  expenseSearch: document.querySelector("#expenseSearch"),
  addExpenseSupplierBtn: document.querySelector("#addExpenseSupplierBtn"),
  expenseCsvInput: document.querySelector("#expenseCsvInput"),
  sampleExpenseCsvBtn: document.querySelector("#sampleExpenseCsvBtn"),
  expenseTable: document.querySelector("#expenseTable"),
  expensePagination: document.querySelector("#expensePagination"),
  customerForm: document.querySelector("#customerForm"),
  customerFormDialog: document.querySelector("#customerFormDialog"),
  customerFormTitle: document.querySelector("#customerFormTitle"),
  customerCode: document.querySelector("#customerCode"),
  customerKind: document.querySelector("#customerKind"),
  customerName: document.querySelector("#customerName"),
  customerEmail: document.querySelector("#customerEmail"),
  customerCountryCode: document.querySelector("#customerCountryCode"),
  customerPhone: document.querySelector("#customerPhone"),
  customerAddress: document.querySelector("#customerAddress"),
  customerTax: document.querySelector("#customerTax"),
  customerTaxOffice: document.querySelector("#customerTaxOffice"),
  customerSaveBtn: document.querySelector("#customerSaveBtn"),
  customerSearch: document.querySelector("#customerSearch"),
  customerList: document.querySelector("#customerList"),
  customerPagination: document.querySelector("#customerPagination"),
  movementCustomerFilter: document.querySelector("#movementCustomerFilter"),
  movementSearch: document.querySelector("#movementSearch"),
  movementSummary: document.querySelector("#movementSummary"),
  movementTable: document.querySelector("#movementTable"),
  addTrackingBtn: document.querySelector("#addTrackingBtn"),
  trackingFormDialog: document.querySelector("#trackingFormDialog"),
  trackingForm: document.querySelector("#trackingForm"),
  trackingFormTitle: document.querySelector("#trackingFormTitle"),
  trackingCustomer: document.querySelector("#trackingCustomer"),
  trackingQuoteList: document.querySelector("#trackingQuoteList"),
  trackingDate: document.querySelector("#trackingDate"),
  trackingNextDate: document.querySelector("#trackingNextDate"),
  trackingStatus: document.querySelector("#trackingStatus"),
  trackingNote: document.querySelector("#trackingNote"),
  trackingSaveBtn: document.querySelector("#trackingSaveBtn"),
  trackingSearch: document.querySelector("#trackingSearch"),
  trackingTable: document.querySelector("#trackingTable"),
  trackingPagination: document.querySelector("#trackingPagination"),
  addReceiptBtn: document.querySelector("#addReceiptBtn"),
  receiptFormDialog: document.querySelector("#receiptFormDialog"),
  receiptForm: document.querySelector("#receiptForm"),
  receiptFormTitle: document.querySelector("#receiptFormTitle"),
  receiptCustomer: document.querySelector("#receiptCustomer"),
  receiptInvoice: document.querySelector("#receiptInvoice"),
  receiptDate: document.querySelector("#receiptDate"),
  receiptAmount: document.querySelector("#receiptAmount"),
  receiptMethod: document.querySelector("#receiptMethod"),
  receiptNote: document.querySelector("#receiptNote"),
  receiptSearch: document.querySelector("#receiptSearch"),
  receiptTable: document.querySelector("#receiptTable"),
  receiptPagination: document.querySelector("#receiptPagination"),
  receiptSaveBtn: document.querySelector("#receiptForm button[type='submit']"),
  productForm: document.querySelector("#productForm"),
  productFormDialog: document.querySelector("#productFormDialog"),
  productCode: document.querySelector("#productCode"),
  productName: document.querySelector("#productName"),
  productCost: document.querySelector("#productCost"),
  productMargin: document.querySelector("#productMargin"),
  productPrice: document.querySelector("#productPrice"),
  productUnit: document.querySelector("#productUnit"),
  productStock: document.querySelector("#productStock"),
  productSearch: document.querySelector("#productSearch"),
  productTable: document.querySelector("#productTable"),
  productPagination: document.querySelector("#productPagination"),
  productCsvInput: document.querySelector("#productCsvInput"),
  sampleProductCsvBtn: document.querySelector("#sampleProductCsvBtn"),
  bulkEditProductsBtn: document.querySelector("#bulkEditProductsBtn"),
  deleteAllProductsBtn: document.querySelector("#deleteAllProductsBtn"),
  productFormTitle: document.querySelector("#productFormTitle"),
  productSaveBtn: document.querySelector("#productSaveBtn"),
  debtSearch: document.querySelector("#debtSearch"),
  debtCsvInput: document.querySelector("#debtCsvInput"),
  sampleDebtCsvBtn: document.querySelector("#sampleDebtCsvBtn"),
  deleteAllDebtsBtn: document.querySelector("#deleteAllDebtsBtn"),
  bulkDebtWhatsappBtn: document.querySelector("#bulkDebtWhatsappBtn"),
  bulkDebtMessageSettingsBtn: document.querySelector("#bulkDebtMessageSettingsBtn"),
  selectAllDebts: document.querySelector("#selectAllDebts"),
  addDebtBtn: document.querySelector("#addDebtBtn"),
  debtFormDialog: document.querySelector("#debtFormDialog"),
  debtForm: document.querySelector("#debtForm"),
  debtFormTitle: document.querySelector("#debtFormTitle"),
  debtContact: document.querySelector("#debtContact"),
  debtName: document.querySelector("#debtName"),
  debtCountryCode: document.querySelector("#debtCountryCode"),
  debtPhone: document.querySelector("#debtPhone"),
  debtAmount: document.querySelector("#debtAmount"),
  debtNote: document.querySelector("#debtNote"),
  debtStatus: document.querySelector("#debtStatus"),
  debtSaveBtn: document.querySelector("#debtSaveBtn"),
  debtTable: document.querySelector("#debtTable"),
  debtTotalBar: document.querySelector("#debtTotalBar"),
  whatsappMessageDialog: document.querySelector("#whatsappMessageDialog"),
  whatsappMessageForm: document.querySelector("#whatsappMessageForm"),
  whatsappMessageText: document.querySelector("#whatsappMessageText"),
  whatsappMessageProgress: document.querySelector("#whatsappMessageProgress"),
  whatsappSendBtn: document.querySelector("#whatsappSendBtn"),
  bulkMessageSettingsDialog: document.querySelector("#bulkMessageSettingsDialog"),
  bulkMessageSettingsForm: document.querySelector("#bulkMessageSettingsForm"),
  bulkMessageTemplate: document.querySelector("#bulkMessageTemplate"),
  bankForm: document.querySelector("#bankForm"),
  bankFormTitle: document.querySelector("#bankFormTitle"),
  bankName: document.querySelector("#bankName"),
  bankAccountName: document.querySelector("#bankAccountName"),
  bankIban: document.querySelector("#bankIban"),
  bankBranch: document.querySelector("#bankBranch"),
  bankCurrency: document.querySelector("#bankCurrency"),
  bankNote: document.querySelector("#bankNote"),
  bankSaveBtn: document.querySelector("#bankSaveBtn"),
  bankList: document.querySelector("#bankList"),
  companyLogoInput: document.querySelector("#companyLogoInput"),
  logoPreviewBox: document.querySelector("#logoPreviewBox"),
  removeLogoBtn: document.querySelector("#removeLogoBtn"),
  companyForm: document.querySelector("#companyForm"),
  companyName: document.querySelector("#companyName"),
  companyPhone: document.querySelector("#companyPhone"),
  companyEmail: document.querySelector("#companyEmail"),
  companyWebsite: document.querySelector("#companyWebsite"),
  companyAddress: document.querySelector("#companyAddress"),
  companyTax: document.querySelector("#companyTax"),
  companyTaxOffice: document.querySelector("#companyTaxOffice"),
  userForm: document.querySelector("#userForm"),
  userFormTitle: document.querySelector("#userFormTitle"),
  userUsername: document.querySelector("#userUsername"),
  userFullName: document.querySelector("#userFullName"),
  userEmail: document.querySelector("#userEmail"),
  userRole: document.querySelector("#userRole"),
  userStatus: document.querySelector("#userStatus"),
  userPassword: document.querySelector("#userPassword"),
  userSaveBtn: document.querySelector("#userSaveBtn"),
  userList: document.querySelector("#userList"),
  reportSummary: document.querySelector("#reportSummary"),
  categoryReport: document.querySelector("#categoryReport"),
  quoteReportSummary: document.querySelector("#quoteReportSummary"),
  topQuoteCustomers: document.querySelector("#topQuoteCustomers"),
  topOrderCustomers: document.querySelector("#topOrderCustomers"),
  reportStartDate: document.querySelector("#reportStartDate"),
  reportEndDate: document.querySelector("#reportEndDate"),
  clearReportDatesBtn: document.querySelector("#clearReportDatesBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput"),
  csvBtn: document.querySelector("#csvBtn"),
  quickInvoiceBtn: document.querySelector("#quickInvoiceBtn"),
  addInvoiceBtn: document.querySelector("#addInvoiceBtn"),
  addQuoteBtn: document.querySelector("#addQuoteBtn"),
  addExpenseBtn: document.querySelector("#addExpenseBtn"),
  addCustomerBtn: document.querySelector("#addCustomerBtn"),
  addProductBtn: document.querySelector("#addProductBtn"),
  invoiceDialog: document.querySelector("#invoiceDialog"),
  invoicePreview: document.querySelector("#invoicePreview"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  printInvoiceBtn: document.querySelector("#printInvoiceBtn"),
  receiptDialog: document.querySelector("#receiptDialog"),
  receiptPreview: document.querySelector("#receiptPreview"),
  closeReceiptDialogBtn: document.querySelector("#closeReceiptDialogBtn"),
  printReceiptBtn: document.querySelector("#printReceiptBtn"),
  imageDialog: document.querySelector("#imageDialog"),
  imageDialogPreview: document.querySelector("#imageDialogPreview"),
  closeImageDialogBtn: document.querySelector("#closeImageDialogBtn"),
  miniToolPanel: document.querySelector("#miniToolPanel"),
  miniToolEyebrow: document.querySelector("#miniToolEyebrow"),
  miniToolTitle: document.querySelector("#miniToolTitle"),
  closeMiniToolBtn: document.querySelector("#closeMiniToolBtn"),
  todoToolBtn: document.querySelector("#todoToolBtn"),
  calendarToolBtn: document.querySelector("#calendarToolBtn"),
  ratesToolBtn: document.querySelector("#ratesToolBtn"),
  todoToolPanel: document.querySelector("#todoToolPanel"),
  calendarToolPanel: document.querySelector("#calendarToolPanel"),
  ratesToolPanel: document.querySelector("#ratesToolPanel"),
  todoForm: document.querySelector("#todoForm"),
  todoInput: document.querySelector("#todoInput"),
  todoList: document.querySelector("#todoList"),
  calendarForm: document.querySelector("#calendarForm"),
  calendarDate: document.querySelector("#calendarDate"),
  calendarNote: document.querySelector("#calendarNote"),
  calendarList: document.querySelector("#calendarList"),
  ratesStatus: document.querySelector("#ratesStatus"),
  ratesList: document.querySelector("#ratesList"),
  refreshRatesBtn: document.querySelector("#refreshRatesBtn"),
};

function loadData() {
  const saved = localStorage.getItem(storeKey);
  if (!saved) return normalizeData(seedData);

  try {
    return normalizeData(JSON.parse(saved));
  } catch {
    return normalizeData(seedData);
  }
}

function normalizeData(source) {
  const users = Array.isArray(source.users) ? source.users : [];
  const normalizedUsers = users.map((user) => {
    const isLegacyPlainUser = Boolean(user.password && !user.passwordHash);
    const normalizedUser = {
      ...user,
      status: user.status || "Aktif",
      role: user.role || "Görüntüleme",
      password: user.password || "",
      passwordHash: user.passwordHash || "",
    };

    if (isLegacyPlainUser) {
      return {
        ...normalizedUser,
        fullName: normalizedUser.fullName || "Sistem Yöneticisi",
        role: "Yönetici",
        status: "Aktif",
      };
    }

    return normalizedUser;
  });

  return {
    customers: source.customers || [],
    products: source.products || [],
    invoices: source.invoices || [],
    quotes: source.quotes || [],
    expenses: source.expenses || [],
    receipts: source.receipts || [],
    debts: source.debts || [],
    tracking: source.tracking || [],
    bankAccounts: source.bankAccounts || [],
    widgets: {
      todos: source.widgets?.todos || [],
      calendar: source.widgets?.calendar || [],
    },
    messageTemplates: {
      debtBulk: source.messageTemplates?.debtBulk || defaultBulkDebtMessageTemplate,
    },
    company: {
      logo: source.company?.logo || "",
      name: source.company?.name || "",
      phone: source.company?.phone || "",
      email: source.company?.email || "",
      website: source.company?.website || "",
      address: source.company?.address || "",
      tax: source.company?.tax || "",
      taxOffice: source.company?.taxOffice || "",
    },
    users: normalizedUsers,
  };
}

function saveData() {
  writeLocalCache();
  if (!cloudApplying) pushToCloud();
}

/* ===================================================================
   BULUT SENKRONİZASYONU (Firebase Firestore)
   - Tüm uygulama verisi tek bir belgede saklanır ve cihazlar arası
     gerçek zamanlı senkronize edilir.
   - Firebase yapılandırılmadıysa bu katman sessizce devre dışı kalır,
     uygulama localStorage ile çalışmaya devam eder.
   =================================================================== */
let cloudDb = null;
let cloudDocRef = null;
let cloudReady = false;       // ilk anlık görüntü alındı mı
let cloudApplying = false;    // buluttan gelen veri uygulanırken true

function cloudConfigured() {
  return Boolean(firebaseConfig.apiKey) && !String(firebaseConfig.apiKey).startsWith("BURAYA");
}

function writeLocalCache() {
  try {
    localStorage.setItem(storeKey, JSON.stringify(data));
  } catch (err) {
    console.warn("[Muhasebe Pro] Yerel kayıt yazılamadı:", err);
  }
}

// Verinin "dolu" olup olmadığını ölçer (boş kurulumun gerçek veriyi ezmemesi için).
function dataWeight(source) {
  if (!source) return 0;
  const arr = (x) => (Array.isArray(x) ? x.length : 0);
  return (
    arr(source.invoices) +
    arr(source.quotes) +
    arr(source.expenses) +
    arr(source.receipts) +
    arr(source.debts) +
    arr(source.tracking) +
    arr(source.bankAccounts) +
    arr(source.customers) +
    arr(source.products) +
    arr(source.users)
  );
}

let cloudSaveTimer = null;
function pushToCloud(immediate = false) {
  if (!cloudDocRef) return;
  if (!cloudReady && !immediate) return; // ilk senkron tamamlanmadan yazma
  if (cloudSaveTimer) clearTimeout(cloudSaveTimer);

  const doWrite = () => {
    const payload = JSON.stringify(data);
    // Firestore tek belge sınırı ~1 MB. Logo / ekran görüntüleri büyükse aşılabilir.
    if (payload.length > 950000) {
      console.warn(
        "[Muhasebe Pro] Veri 1 MB sınırına yaklaştığı için buluta KAYDEDİLMEDİ. " +
          "Logo veya teklif ekran görüntülerinin boyutunu küçültün."
      );
      return;
    }
    cloudDocRef
      .set({
        payload,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .catch((err) => console.warn("[Muhasebe Pro] Bulut kaydı hatası:", err));
  };

  if (immediate) doWrite();
  else cloudSaveTimer = setTimeout(doWrite, 600);
}

function applyRemoteData(parsed) {
  cloudApplying = true;
  try {
    data = normalizeData(parsed);
    writeLocalCache();
    renderAll();
    applyAuthState();
  } finally {
    cloudApplying = false;
  }
}

async function initCloudSync() {
  if (!cloudConfigured()) {
    console.info("[Muhasebe Pro] Firebase ayarlanmadı; veriler yalnızca bu tarayıcıda saklanıyor.");
    return;
  }
  if (typeof firebase === "undefined" || !firebase.initializeApp) {
    console.warn("[Muhasebe Pro] Firebase SDK yüklenemedi (internet/CDN engeli olabilir).");
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    cloudDb = firebase.firestore();
    await firebase.auth().signInAnonymously();
    cloudDocRef = cloudDb.collection(cloudCollection).doc(cloudWorkspaceId);

    cloudDocRef.onSnapshot(
      (snap) => {
        // Kendi yazdığımız değişikliğin yankısını atla.
        if (snap.metadata.hasPendingWrites) return;

        if (!snap.exists) {
          // Bulutta henüz veri yok → mevcut yerel veriyle ilk kez oluştur.
          cloudReady = true;
          pushToCloud(true);
          return;
        }

        const remote = snap.data();
        let parsed = null;
        if (remote && typeof remote.payload === "string") {
          try {
            parsed = JSON.parse(remote.payload);
          } catch {
            parsed = null;
          }
        }

        // İlk senkron: buluttaki veri boşsa ve yerelde gerçek veri varsa,
        // yereli koru ve buluta gönder (boş cihazın dolu cihazı ezmesini önler).
        if (!cloudReady) {
          cloudReady = true;
          if (parsed && dataWeight(parsed) === 0 && dataWeight(data) > 0) {
            pushToCloud(true);
            return;
          }
        }

        if (parsed) applyRemoteData(parsed);
      },
      (err) => console.warn("[Muhasebe Pro] Bulut dinleme hatası:", err)
    );
  } catch (err) {
    console.warn("[Muhasebe Pro] Bulut başlatılamadı:", err);
  }
}

function getCurrentUser() {
  const username = sessionStorage.getItem(sessionKey);
  if (!username) return null;
  return (data.users || []).find((user) => user.username === username && user.status !== "Pasif") || null;
}

function applyAuthState() {
  const hasUsers = (data.users || []).length > 0;
  const user = getCurrentUser();
  const isLoggedIn = !!user;
  els.loginScreen.classList.toggle("is-hidden", isLoggedIn);
  els.appShell.classList.toggle("is-hidden", !isLoggedIn);
  els.sessionUser.textContent = user ? `${user.fullName || user.username} · ${user.role || ""}` : "";
  els.loginForm.querySelector("h1").textContent = hasUsers ? "Giriş Yap" : "İlk Kullanıcıyı Oluştur";
  els.loginForm.querySelector(".primary-button").textContent = hasUsers ? "Giriş Yap" : "Kullanıcıyı Oluştur";
  els.loginForm.querySelector(".muted").textContent = hasUsers
    ? "Giriş bilgileri ayarlar bölümünden yönetilir."
    : "İlk girişte yazacağınız bilgiler yönetici hesabı olarak kaydedilir.";
  if (!isLoggedIn) {
    els.loginUsername.focus();
  }
}

async function hashPassword(password) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function passwordMatches(user, password) {
  if (user.passwordHash) return user.passwordHash === (await hashPassword(password));
  return String(user.password || "") === password;
}

async function migratePassword(user, password) {
  if (user.passwordHash || !user.password) return;
  user.passwordHash = await hashPassword(password);
  user.password = "";
  saveData();
}

async function createFirstAdmin(username, password) {
  const user = {
    id: crypto.randomUUID(),
    username,
    fullName: "Yönetici",
    email: username,
    role: "Yönetici",
    status: "Aktif",
    password: "",
    passwordHash: await hashPassword(password),
  };
  data.users = [user];
  saveData();
  return user;
}

async function login(event) {
  event.preventDefault();
  const username = els.loginUsername.value.trim();
  const password = els.loginPassword.value;
  const hasUsers = (data.users || []).length > 0;

  if (!hasUsers) {
    const user = await createFirstAdmin(username, password);
    sessionStorage.setItem(sessionKey, user.username);
    els.loginError.textContent = "";
    els.loginForm.reset();
    renderAll();
    applyAuthState();
    return;
  }

  const user = (data.users || []).find((item) => item.username === username);

  if (!user || user.status === "Pasif" || !(await passwordMatches(user, password))) {
    els.loginError.textContent = "Kullanıcı adı veya şifre hatalı.";
    return;
  }

  await migratePassword(user, password);
  sessionStorage.setItem(sessionKey, user.username);
  els.loginError.textContent = "";
  els.loginForm.reset();
  applyAuthState();
}

function logout() {
  sessionStorage.removeItem(sessionKey);
  applyAuthState();
}

function money(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function numberText(value, digits = 2) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value) || 0);
}

function shortDate(value) {
  return new Intl.DateTimeFormat("tr-TR").format(new Date(value));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function totalInvoice(invoice) {
  if (Array.isArray(invoice.lines)) {
    return invoice.lines.reduce((sum, line) => sum + line.subtotal + line.vatAmount, 0);
  }
  return invoice.subtotal + invoice.vatAmount;
}

function isReturnInvoice(invoice) {
  return normalizeSearch(typeof invoice === "string" ? invoice : invoice?.type).includes("iade");
}

function invoiceStockKind(invoice) {
  return isReturnInvoice(invoice) ? "purchase" : "sale";
}

function invoiceSubtotal(invoice) {
  if (Array.isArray(invoice.lines)) {
    return invoice.lines.reduce((sum, line) => sum + line.subtotal, 0);
  }
  return invoice.subtotal || 0;
}

function invoiceVatTotal(invoice) {
  if (Array.isArray(invoice.lines)) {
    return invoice.lines.reduce((sum, line) => sum + line.vatAmount, 0);
  }
  return invoice.vatAmount || 0;
}

function getCustomer(id) {
  return data.customers.find((customer) => customer.id === id);
}

function getProduct(id) {
  return data.products.find((product) => product.id === id);
}

function findProductByCodeOrName(value) {
  const normalized = normalizeSearch(value);
  if (!normalized) return undefined;
  return data.products.find((product) => {
    const code = normalizeSearch(product.code || "");
    const name = normalizeSearch(product.name || "");
    return code === normalized || name === normalized || `${code} ${name}` === normalized;
  });
}

function createProductFromInvoiceLine(line, kind) {
  const code = line.productCode || nextProductCode();
  const name = line.productName || code;
  const cost = kind === "purchase" ? line.unitPrice : 0;
  const price = kind === "sale" ? line.unitPrice : line.unitPrice;
  const product = {
    id: crypto.randomUUID(),
    code,
    name,
    cost,
    margin: 0,
    price,
    unit: line.unit || "Adet",
    stock: 0,
    createdAt: new Date().toISOString(),
  };
  data.products.push(product);
  return product;
}

function ensureInvoiceLineProducts(lines, kind) {
  return lines.map((line) => {
    let product = getProduct(line.productId) || findProductByCodeOrName(line.productCode) || findProductByCodeOrName(line.productName);
    if (!product && (line.productCode || line.productName)) {
      product = createProductFromInvoiceLine(line, kind);
    }
    return {
      ...line,
      productId: product?.id || "",
      productName: product?.name || line.productName,
      productCode: product?.code || line.productCode,
      unit: line.unit || product?.unit || "Adet",
    };
  });
}

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR");
}

function setDefaults() {
  els.invoiceDate.value = today();
  els.invoiceDue.value = addDays(14);
  els.invoiceNumber.value = nextInvoiceNumber();
  if (els.quoteDate) els.quoteDate.value = today();
  if (els.quoteValidUntil) els.quoteValidUntil.value = addDays(7);
  if (els.quoteNumber) els.quoteNumber.value = nextQuoteNumber();
  els.expenseDate.value = today();
  if (els.trackingDate) els.trackingDate.value = today();
  if (els.receiptDate) els.receiptDate.value = today();
}

function openFormDialog(dialog) {
  setDefaults();
  renderSelects();
  if (dialog === els.invoiceFormDialog) {
    editingInvoiceId = null;
    els.invoiceFormTitle.textContent = "Yeni Satış Faturası Oluştur";
    els.invoiceSaveBtn.textContent = "Kaydet";
    resetInvoiceLines();
    updateInvoiceTotals();
  }
  if (dialog === els.quoteFormDialog) {
    editingQuoteId = null;
    pendingQuoteScreenshot = "";
    els.quoteFormTitle.textContent = "Yeni Fiyat Teklifi Oluştur";
    els.quoteSaveBtn.textContent = "Kaydet";
    resetQuoteLines();
    renderQuoteScreenshotPreview();
    updateQuoteTotals();
  }
  if (dialog === els.expenseFormDialog) {
    editingExpenseId = null;
    els.expenseFormTitle.textContent = "Alış Faturası Ekle";
    els.expenseSaveBtn.textContent = "Alış Faturasını Kaydet";
    resetExpenseLines();
    updateExpenseTotals();
  }
  if (dialog === els.customerFormDialog) {
    resetCustomerForm();
    els.customerCode.value = nextCustomerCode(els.customerKind.value);
  }
  if (dialog === els.trackingFormDialog) {
    resetTrackingForm();
  }
  if (dialog === els.receiptFormDialog) {
    resetReceiptForm();
  }
  if (dialog === els.debtFormDialog) {
    resetDebtForm();
  }
  if (dialog === els.productFormDialog && !els.productCode.value) {
    editingProductId = null;
    els.productFormTitle.textContent = "Ürün Ekle";
    els.productSaveBtn.textContent = "Ürünü Kaydet";
    els.productCode.value = nextProductCode();
  }
  dialog.showModal();
}

function closeFormDialog(dialog) {
  if (dialog === els.invoiceFormDialog) {
    editingInvoiceId = null;
    els.invoiceForm.reset();
    els.invoiceFormTitle.textContent = "Yeni Satış Faturası Oluştur";
    els.invoiceSaveBtn.textContent = "Kaydet";
    setDefaults();
    resetInvoiceLines();
    updateInvoiceTotals();
  }
  if (dialog === els.quoteFormDialog) {
    editingQuoteId = null;
    pendingQuoteScreenshot = "";
    els.quoteForm.reset();
    els.quoteFormTitle.textContent = "Yeni Fiyat Teklifi Oluştur";
    els.quoteSaveBtn.textContent = "Kaydet";
    setDefaults();
    resetQuoteLines();
    renderQuoteScreenshotPreview();
    updateQuoteTotals();
  }
  if (dialog === els.expenseFormDialog) {
    editingExpenseId = null;
    els.expenseForm.reset();
    els.expenseFormTitle.textContent = "Alış Faturası Ekle";
    els.expenseSaveBtn.textContent = "Alış Faturasını Kaydet";
    setDefaults();
    resetExpenseLines();
    updateExpenseTotals();
  }
  if (dialog === els.productFormDialog) {
    editingProductId = null;
    els.productForm.reset();
    els.productUnit.value = "Adet";
    els.productFormTitle.textContent = "Ürün Ekle";
    els.productSaveBtn.textContent = "Ürünü Kaydet";
  }
  if (dialog === els.customerFormDialog) {
    resetCustomerForm();
    pendingCustomerTarget = "";
  }
  if (dialog === els.trackingFormDialog) {
    resetTrackingForm();
  }
  if (dialog === els.receiptFormDialog) {
    resetReceiptForm();
  }
  if (dialog === els.debtFormDialog) {
    resetDebtForm();
  }
  if (dialog === els.whatsappMessageDialog) {
    pendingWhatsappRecipients = [];
    pendingWhatsappIndex = 0;
    pendingWhatsappTemplate = "";
    pendingWhatsappPhone = "";
    els.whatsappMessageProgress.textContent = "";
    els.whatsappSendBtn.textContent = "WhatsApp'a Gönder";
  }
  dialog.close();
}

function renderSelects() {
  const byName = (left, right) => (left.name || "").localeCompare(right.name || "", "tr", { sensitivity: "base" });
  const salesCustomers = data.customers.filter((customer) => customer.kind !== "supplier").sort(byName);
  const suppliers = data.customers.filter((customer) => customer.kind === "supplier").sort(byName);
  const selectedInvoiceCustomer = els.invoiceCustomer.value;
  els.invoiceCustomer.innerHTML = [
    `<option value="" disabled selected>Seçin</option>`,
    ...salesCustomers.map((customer) => `<option value="${customer.id}">${customer.name}</option>`),
  ].join("");
  els.invoiceCustomer.value = salesCustomers.some((customer) => customer.id === selectedInvoiceCustomer)
    ? selectedInvoiceCustomer
    : "";
  if (els.quoteCustomer) {
    const selectedQuoteCustomer = els.quoteCustomer.value;
    els.quoteCustomer.innerHTML = [
      `<option value="" disabled selected>Seçin</option>`,
      ...salesCustomers.map((customer) => `<option value="${customer.id}">${customer.name}</option>`),
    ].join("");
    els.quoteCustomer.value = salesCustomers.some((customer) => customer.id === selectedQuoteCustomer)
      ? selectedQuoteCustomer
      : "";
  }
  const selectedExpenseCategory = els.expenseCategory.value;
  els.expenseCategory.innerHTML = [
    `<option value="" disabled selected>Tedarikçi seçin</option>`,
    ...suppliers.map((supplier) => `<option value="${supplier.name}">${supplier.name}</option>`),
  ].join("");
  els.expenseCategory.value = suppliers.some((supplier) => supplier.name === selectedExpenseCategory)
    ? selectedExpenseCategory
    : "";
  els.productCodeList.innerHTML = data.products
    .map((product) => `<option value="${product.code || ""}">${product.name}</option>`)
    .join("");
  els.productDescriptionList.innerHTML = data.products
    .map((product) => `<option value="${product.name}">${product.code || "-"}</option>`)
    .join("");
  if (els.movementCustomerFilter) {
    const selected = els.movementCustomerFilter.value;
    els.movementCustomerFilter.innerHTML = data.customers
      .slice()
      .sort(byName)
      .map((customer) => `<option value="${customer.id}">${customer.code || "-"} · ${customer.name}</option>`)
      .join("");
    els.movementCustomerFilter.value = data.customers.some((customer) => customer.id === selected)
      ? selected
      : data.customers[0]?.id || "";
  }
  if (els.receiptCustomer) {
    const selectedReceiptCustomer = els.receiptCustomer.value;
    const customers = data.customers.filter((customer) => customer.kind !== "supplier").sort(byName);
    els.receiptCustomer.innerHTML = [
      `<option value="" disabled selected>Müşteri seçin</option>`,
      ...customers.map((customer) => `<option value="${customer.id}">${customer.code || "-"} · ${customer.name}</option>`),
    ].join("");
    els.receiptCustomer.value = customers.some((customer) => customer.id === selectedReceiptCustomer) ? selectedReceiptCustomer : "";
    renderReceiptInvoiceOptions();
  }
  if (els.trackingCustomer) {
    const selectedTrackingCustomer = els.trackingCustomer.value;
    const customers = data.customers.filter((customer) => customer.kind !== "supplier").sort(byName);
    els.trackingCustomer.innerHTML = [
      `<option value="" disabled selected>Müşteri seçin</option>`,
      ...customers.map((customer) => `<option value="${customer.id}">${customer.code || "-"} · ${customer.name}</option>`),
    ].join("");
    els.trackingCustomer.value = customers.some((customer) => customer.id === selectedTrackingCustomer)
      ? selectedTrackingCustomer
      : "";
    renderTrackingCustomerQuotes();
  }
}

function nextCustomerCode(kind) {
  const prefix = kind === "supplier" ? "320.01." : "120.01.";
  const usedNumbers = data.customers
    .map((customer) => customer.code || "")
    .filter((code) => code.startsWith(prefix))
    .map((code) => Number(code.slice(prefix.length)))
    .filter(Number.isFinite);
  const next = Math.max(0, ...usedNumbers) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

function nextProductCode() {
  const prefix = "STK-";
  const usedNumbers = data.products
    .map((product) => product.code || "")
    .filter((code) => code.startsWith(prefix))
    .map((code) => Number(code.slice(prefix.length)))
    .filter(Number.isFinite);
  const next = Math.max(0, ...usedNumbers) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

function nextInvoiceNumber() {
  return `BLK${new Date().getFullYear()}${String(data.invoices.length + 1).padStart(9, "0")}`;
}

function nextQuoteNumber() {
  return `TEK${new Date().getFullYear()}${String((data.quotes || []).length + 1).padStart(7, "0")}`;
}

function productOptions() {
  return data.products.map((product) => `<option value="${product.name}">${product.code || "-"}</option>`).join("");
}

function resetInvoiceLines() {
  els.invoiceLines.innerHTML = createInvoiceLineHtml(true);
}

function resetQuoteLines() {
  els.quoteLines.innerHTML = createQuoteLineHtml(true);
}

function createInvoiceLineHtml(isFirst = false) {
  return `
    <div class="invoice-line">
      <input class="invoice-line-code" ${isFirst ? 'id="invoiceProductCode"' : ""} list="productCodeList" placeholder="Stok kodu ara" />
      <input class="invoice-line-product" ${isFirst ? 'id="invoiceProduct"' : ""} list="productDescriptionList" placeholder="Açıklama ara" required />
      <input class="invoice-line-qty" ${isFirst ? 'id="invoiceQty"' : ""} type="text" inputmode="decimal" value="1" required />
      <select class="invoice-line-unit" ${isFirst ? 'id="invoiceUnit"' : ""}>${unitOptions("Adet")}</select>
      <input class="invoice-line-price" ${isFirst ? 'id="invoiceLinePrice"' : ""} type="text" inputmode="decimal" value="0" required />
      <select class="invoice-line-vat" ${isFirst ? 'id="invoiceVat"' : ""}>
        <option value="0">%0</option>
        <option value="1">%1</option>
        <option value="10">%10</option>
        <option value="20" selected>%20</option>
      </select>
      <output class="invoice-line-total" ${isFirst ? 'id="invoiceLineTotal"' : ""}>0,00 ₺</output>
      <button class="line-remove-button" type="button" title="Kalemi sil">×</button>
    </div>
  `;
}

function createInvoiceLineFromData(line, isFirst = false) {
  const product = getProduct(line.productId);
  const unit = line.unit || product?.unit || "Adet";
  const vatRate = Number(line.vatRate ?? 20);
  return `
    <div class="invoice-line" data-product-id="${line.productId || ""}">
      <input class="invoice-line-code" ${isFirst ? 'id="invoiceProductCode"' : ""} list="productCodeList" placeholder="Stok kodu ara" value="${escapeHtml(product?.code || line.productCode || "")}" />
      <input class="invoice-line-product" ${isFirst ? 'id="invoiceProduct"' : ""} list="productDescriptionList" placeholder="Açıklama ara" value="${escapeHtml(line.productName || product?.name || "")}" required />
      <input class="invoice-line-qty" ${isFirst ? 'id="invoiceQty"' : ""} type="text" inputmode="decimal" value="${line.quantity || 1}" required />
      <select class="invoice-line-unit" ${isFirst ? 'id="invoiceUnit"' : ""}>${unitOptions(unit)}</select>
      <input class="invoice-line-price" ${isFirst ? 'id="invoiceLinePrice"' : ""} type="text" inputmode="decimal" value="${numberText(line.unitPrice || 0)}" required />
      <select class="invoice-line-vat" ${isFirst ? 'id="invoiceVat"' : ""}>
        <option value="0" ${vatRate === 0 ? "selected" : ""}>%0</option>
        <option value="1" ${vatRate === 1 ? "selected" : ""}>%1</option>
        <option value="10" ${vatRate === 10 ? "selected" : ""}>%10</option>
        <option value="20" ${vatRate === 20 ? "selected" : ""}>%20</option>
      </select>
      <output class="invoice-line-total" ${isFirst ? 'id="invoiceLineTotal"' : ""}>0,00 ₺</output>
      <button class="line-remove-button" type="button" title="Kalemi sil">×</button>
    </div>
  `;
}

function collectInvoiceLines() {
  return [...els.invoiceLines.querySelectorAll(".invoice-line")].map((row) => {
    const codeValue = row.querySelector(".invoice-line-code")?.value.trim() || "";
    const nameValue = row.querySelector(".invoice-line-product").value.trim();
    const product =
      getProduct(row.dataset.productId) ||
      findProductByCodeOrName(codeValue) ||
      findProductByCodeOrName(nameValue);
    const quantity = parseNumber(row.querySelector(".invoice-line-qty").value);
    const unit = row.querySelector(".invoice-line-unit").value || product?.unit || "Adet";
    const unitPrice = parseNumber(row.querySelector(".invoice-line-price").value);
    const vatRate = Number(row.querySelector(".invoice-line-vat").value) || 0;
    const subtotal = quantity * unitPrice;
    const vatAmount = subtotal * (vatRate / 100);
    return {
      productId: product?.id || "",
      productCode: product?.code || codeValue,
      productName: product?.name || nameValue,
      quantity,
      unit,
      unitPrice,
      vatRate,
      vatAmount,
      subtotal,
    };
  });
}

function createQuoteLineHtml(isFirst = false) {
  return `
    <div class="invoice-line">
      <input class="quote-line-code" ${isFirst ? 'id="quoteProductCode"' : ""} list="productCodeList" placeholder="Stok kodu ara" />
      <input class="quote-line-product" ${isFirst ? 'id="quoteProduct"' : ""} list="productDescriptionList" placeholder="Açıklama ara" required />
      <input class="quote-line-qty" ${isFirst ? 'id="quoteQty"' : ""} type="text" inputmode="decimal" value="1" required />
      <select class="quote-line-unit" ${isFirst ? 'id="quoteUnit"' : ""}>${unitOptions("Adet")}</select>
      <input class="quote-line-price" ${isFirst ? 'id="quoteLinePrice"' : ""} type="text" inputmode="decimal" value="0" required />
      <select class="quote-line-vat" ${isFirst ? 'id="quoteVat"' : ""}>
        <option value="0">%0</option>
        <option value="1">%1</option>
        <option value="10">%10</option>
        <option value="20" selected>%20</option>
      </select>
      <output class="quote-line-total invoice-line-total" ${isFirst ? 'id="quoteLineTotal"' : ""}>0,00 ₺</output>
      <button class="line-remove-button" type="button" title="Kalemi sil">×</button>
    </div>
  `;
}

function createQuoteLineFromData(line, isFirst = false) {
  const product = getProduct(line.productId) || findProductByCodeOrName(line.productCode) || findProductByCodeOrName(line.productName);
  const unit = line.unit || product?.unit || "Adet";
  const vatRate = Number(line.vatRate ?? 20);
  return `
    <div class="invoice-line" data-product-id="${product?.id || line.productId || ""}">
      <input class="quote-line-code" ${isFirst ? 'id="quoteProductCode"' : ""} list="productCodeList" placeholder="Stok kodu ara" value="${escapeHtml(product?.code || line.productCode || "")}" />
      <input class="quote-line-product" ${isFirst ? 'id="quoteProduct"' : ""} list="productDescriptionList" placeholder="Açıklama ara" value="${escapeHtml(product?.name || line.productName || "")}" required />
      <input class="quote-line-qty" ${isFirst ? 'id="quoteQty"' : ""} type="text" inputmode="decimal" value="${numberText(line.quantity || 1)}" required />
      <select class="quote-line-unit" ${isFirst ? 'id="quoteUnit"' : ""}>${unitOptions(unit)}</select>
      <input class="quote-line-price" ${isFirst ? 'id="quoteLinePrice"' : ""} type="text" inputmode="decimal" value="${numberText(line.unitPrice || product?.price || 0)}" required />
      <select class="quote-line-vat" ${isFirst ? 'id="quoteVat"' : ""}>
        <option value="0" ${vatRate === 0 ? "selected" : ""}>%0</option>
        <option value="1" ${vatRate === 1 ? "selected" : ""}>%1</option>
        <option value="10" ${vatRate === 10 ? "selected" : ""}>%10</option>
        <option value="20" ${vatRate === 20 ? "selected" : ""}>%20</option>
      </select>
      <output class="quote-line-total invoice-line-total" ${isFirst ? 'id="quoteLineTotal"' : ""}>0,00 ₺</output>
      <button class="line-remove-button" type="button" title="Kalemi sil">×</button>
    </div>
  `;
}

function collectQuoteLines() {
  return [...els.quoteLines.querySelectorAll(".invoice-line")].map((row) => {
    const codeValue = row.querySelector(".quote-line-code")?.value.trim() || "";
    const nameValue = row.querySelector(".quote-line-product").value.trim();
    const product =
      getProduct(row.dataset.productId) ||
      findProductByCodeOrName(codeValue) ||
      findProductByCodeOrName(nameValue);
    const quantity = parseNumber(row.querySelector(".quote-line-qty").value);
    const unit = row.querySelector(".quote-line-unit").value || product?.unit || "Adet";
    const unitPrice = parseNumber(row.querySelector(".quote-line-price").value);
    const vatRate = Number(row.querySelector(".quote-line-vat").value) || 0;
    const subtotal = quantity * unitPrice;
    const vatAmount = subtotal * (vatRate / 100);
    return {
      productId: product?.id || "",
      productCode: product?.code || codeValue,
      productName: product?.name || nameValue,
      quantity,
      unit,
      unitPrice,
      vatRate,
      vatAmount,
      subtotal,
    };
  });
}

function updateInvoiceTotals() {
  const lines = collectInvoiceLines();
  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const vatAmount = lines.reduce((sum, line) => sum + line.vatAmount, 0);

  els.invoiceLines.querySelectorAll(".invoice-line").forEach((row, index) => {
    row.querySelector(".invoice-line-total").textContent = money(lines[index].subtotal + lines[index].vatAmount);
  });
  els.invoiceSubtotalPreview.textContent = money(subtotal);
  els.invoiceVatPreview.textContent = money(vatAmount);
  els.invoiceTotalPreview.textContent = money(subtotal + vatAmount);
  els.invoiceVatPreview.previousElementSibling.textContent = `KDV (${currentVatLabel()}):`;
}

function updateQuoteTotals() {
  const lines = collectQuoteLines();
  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const vatAmount = lines.reduce((sum, line) => sum + line.vatAmount, 0);

  els.quoteLines.querySelectorAll(".invoice-line").forEach((row, index) => {
    row.querySelector(".quote-line-total").textContent = money(lines[index].subtotal + lines[index].vatAmount);
  });
  els.quoteSubtotalPreview.textContent = money(subtotal);
  els.quoteVatPreview.textContent = money(vatAmount);
  els.quoteTotalPreview.textContent = money(subtotal + vatAmount);
}

function renderQuoteScreenshotPreview() {
  if (!els.quoteScreenshotPreview) return;
  els.quoteScreenshotPreview.innerHTML = pendingQuoteScreenshot
    ? `<button class="image-thumb-button large" type="button" data-view-current-quote-image title="Görseli aç"><img src="${pendingQuoteScreenshot}" alt="Teklife ait ekran görüntüsü" /></button>`
    : `<span>Görsel yok</span>`;
}

function setQuoteScreenshotFromFile(file, input) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Lütfen geçerli bir ekran görüntüsü seçin.");
    if (input) input.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    pendingQuoteScreenshot = reader.result;
    renderQuoteScreenshotPreview();
    if (input) input.value = "";
  };
  reader.readAsDataURL(file);
}

function saveQuoteScreenshot(event) {
  setQuoteScreenshotFromFile(event.target.files?.[0], event.target);
}

function pasteQuoteScreenshot(event) {
  if (!els.quoteFormDialog.open) return;
  const imageItem = [...(event.clipboardData?.items || [])].find((item) => item.type.startsWith("image/"));
  if (!imageItem) return;

  event.preventDefault();
  setQuoteScreenshotFromFile(imageItem.getAsFile());
}

function removeQuoteScreenshot() {
  pendingQuoteScreenshot = "";
  if (els.quoteScreenshotInput) els.quoteScreenshotInput.value = "";
  renderQuoteScreenshotPreview();
}

function openImageDialog(src) {
  if (!src) return;
  els.imageDialogPreview.innerHTML = `<img src="${src}" alt="Ekran görüntüsü" />`;
  els.imageDialog.showModal();
}

function resetExpenseLines() {
  els.expenseLines.innerHTML = createExpenseLineHtml(true);
}

function createExpenseLineHtml(isFirst = false) {
  return `
    <div class="invoice-line">
      <input class="purchase-line-code" ${isFirst ? 'id="expenseProductCode"' : ""} list="productCodeList" placeholder="Stok kodu ara" />
      <input class="purchase-line-product" ${isFirst ? 'id="expenseProduct"' : ""} list="productDescriptionList" placeholder="Açıklama ara" required />
      <input class="purchase-line-qty" ${isFirst ? 'id="expenseQty"' : ""} type="text" inputmode="decimal" value="1" required />
      <select class="purchase-line-unit" ${isFirst ? 'id="expenseUnit"' : ""}>${unitOptions("Adet")}</select>
      <input class="purchase-line-price" ${isFirst ? 'id="expenseLinePrice"' : ""} type="text" inputmode="decimal" value="0" required />
      <select class="purchase-line-vat" ${isFirst ? 'id="expenseVat"' : ""}>
        <option value="0">%0</option>
        <option value="1">%1</option>
        <option value="10">%10</option>
        <option value="20" selected>%20</option>
      </select>
      <output class="purchase-line-total invoice-line-total" ${isFirst ? 'id="expenseLineTotal"' : ""}>0,00 ₺</output>
      <button class="line-remove-button" type="button" title="Kalemi sil">×</button>
    </div>
  `;
}

function createExpenseLineFromData(line, isFirst = false) {
  const product = getProduct(line.productId);
  const unit = line.unit || product?.unit || "Adet";
  const vatRate = Number(line.vatRate ?? 20);
  return `
    <div class="invoice-line" data-product-id="${line.productId || ""}">
      <input class="purchase-line-code" ${isFirst ? 'id="expenseProductCode"' : ""} list="productCodeList" placeholder="Stok kodu ara" value="${escapeHtml(product?.code || line.productCode || "")}" />
      <input class="purchase-line-product" ${isFirst ? 'id="expenseProduct"' : ""} list="productDescriptionList" placeholder="Açıklama ara" value="${escapeHtml(line.productName || product?.name || "")}" required />
      <input class="purchase-line-qty" ${isFirst ? 'id="expenseQty"' : ""} type="text" inputmode="decimal" value="${line.quantity || 1}" required />
      <select class="purchase-line-unit" ${isFirst ? 'id="expenseUnit"' : ""}>${unitOptions(unit)}</select>
      <input class="purchase-line-price" ${isFirst ? 'id="expenseLinePrice"' : ""} type="text" inputmode="decimal" value="${numberText(line.unitPrice || 0)}" required />
      <select class="purchase-line-vat" ${isFirst ? 'id="expenseVat"' : ""}>
        <option value="0" ${vatRate === 0 ? "selected" : ""}>%0</option>
        <option value="1" ${vatRate === 1 ? "selected" : ""}>%1</option>
        <option value="10" ${vatRate === 10 ? "selected" : ""}>%10</option>
        <option value="20" ${vatRate === 20 ? "selected" : ""}>%20</option>
      </select>
      <output class="purchase-line-total invoice-line-total" ${isFirst ? 'id="expenseLineTotal"' : ""}>0,00 ₺</output>
      <button class="line-remove-button" type="button" title="Kalemi sil">×</button>
    </div>
  `;
}

function collectExpenseLines() {
  return [...document.querySelectorAll("#expenseLines .invoice-line")].map((row) => {
    const codeValue = row.querySelector(".purchase-line-code")?.value.trim() || "";
    const nameValue = row.querySelector(".purchase-line-product").value.trim();
    const product =
      getProduct(row.dataset.productId) ||
      findProductByCodeOrName(codeValue) ||
      findProductByCodeOrName(nameValue);
    const quantity = parseNumber(row.querySelector(".purchase-line-qty").value);
    const unit = row.querySelector(".purchase-line-unit").value || product?.unit || "Adet";
    const unitPrice = parseNumber(row.querySelector(".purchase-line-price").value);
    const vatRate = Number(row.querySelector(".purchase-line-vat").value) || 0;
    const subtotal = quantity * unitPrice;
    const vatAmount = subtotal * (vatRate / 100);
    return {
      productId: product?.id || "",
      productCode: product?.code || codeValue,
      productName: product?.name || nameValue,
      quantity,
      unit,
      unitPrice,
      vatRate,
      vatAmount,
      subtotal,
    };
  });
}

function updateExpenseTotals() {
  const lines = collectExpenseLines();
  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const vatAmount = lines.reduce((sum, line) => sum + line.vatAmount, 0);

  document.querySelectorAll("#expenseLines .invoice-line").forEach((row, index) => {
    row.querySelector(".purchase-line-total").textContent = money(lines[index].subtotal + lines[index].vatAmount);
  });
  els.expenseSubtotalPreview.textContent = money(subtotal);
  els.expenseVatPreview.textContent = money(vatAmount);
  els.expenseTotalPreview.textContent = money(subtotal + vatAmount);
  els.expenseAmount.value = subtotal + vatAmount;
}

function currentVatLabel() {
  const rates = [...els.invoiceLines.querySelectorAll(".invoice-line-vat")].map((select) => `%${select.value}`);
  return [...new Set(rates)].join(", ");
}

function renderDashboard() {
  const sales = data.invoices.reduce((sum, invoice) => sum + totalInvoice(invoice), 0);
  const expenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const collected = getCollectedTotal();
  const pending = Math.max(0, sales - collected);

  els.totalSales.textContent = money(sales);
  els.totalExpenses.textContent = money(expenses);
  els.netBalance.textContent = money(sales - expenses);
  els.pendingAmount.textContent = money(pending);
  els.currentMonth.textContent = new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  renderFlowChart();
  renderActivity();
}

function renderFlowChart() {
  const months = getLastMonths(6);
  const totals = months.map((month) => {
    const sales = data.invoices
      .filter((invoice) => invoice.date.startsWith(month.key))
      .reduce((sum, invoice) => sum + totalInvoice(invoice), 0);
    const expenses = data.expenses
      .filter((expense) => expense.date.startsWith(month.key))
      .reduce((sum, expense) => sum + expense.amount, 0);
    return { ...month, sales, expenses };
  });
  const max = Math.max(1, ...totals.map((item) => Math.max(item.sales, item.expenses)));

  els.flowChart.innerHTML = totals
    .map(
      (item) => `
        <div class="bar-pair" title="${item.label}: satış ${money(item.sales)}, alış ${money(item.expenses)}">
          <div class="bar sales" style="height: ${(item.sales / max) * 100}%"></div>
          <div class="bar expenses" style="height: ${(item.expenses / max) * 100}%"></div>
          <span class="bar-label">${item.label}</span>
        </div>
      `,
    )
    .join("");
}

function getLastMonths(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (count - 1 - index));
    const key = date.toISOString().slice(0, 7);
    const label = new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(date);
    return { key, label };
  });
}

function renderActivity() {
  const invoices = data.invoices.map((invoice) => ({
    type: "Satış Faturası",
    title: getCustomer(invoice.customerId)?.name || "Cari silinmiş",
    date: invoice.date,
    amount: totalInvoice(invoice),
  }));
  const expenses = data.expenses.map((expense) => ({
    type: "Alış Faturası",
    title: expense.title,
    date: expense.date,
    amount: -expense.amount,
  }));
  const items = [...invoices, ...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  els.activityList.innerHTML = items.length
    ? items
        .map(
          (item) => `
          <div class="activity-item">
            <div>
              <strong>${item.title}</strong>
              <span>${item.type} · ${shortDate(item.date)}</span>
            </div>
            <strong>${money(item.amount)}</strong>
          </div>
        `,
        )
        .join("")
    : `<div class="empty-state">Henüz hareket yok.</div>`;
}

function renderInvoices() {
  const query = els.invoiceSearch.value.trim().toLocaleLowerCase("tr-TR");
  const invoices = sortNewestFirst(
    data.invoices.filter((invoice) => {
      const customer = getCustomer(invoice.customerId)?.name || "";
      return `${invoice.number} ${invoice.type || "Satış Faturası"} ${customer}`.toLocaleLowerCase("tr-TR").includes(query);
    }),
  );
  const visibleInvoices = paginatedRecords(invoices, "invoices");
  renderPagination(els.invoicePagination, "invoices", invoices.length);

  els.invoiceTable.innerHTML = invoices.length
    ? visibleInvoices
        .map((invoice) => {
          const customer = getCustomer(invoice.customerId);
          return `
            <tr>
              <td>${invoice.number}</td>
              <td>${invoice.type || "Satış Faturası"}</td>
              <td>${customer?.name || "Cari silinmiş"}</td>
              <td>${shortDate(invoice.date)}</td>
              <td>${money(totalInvoice(invoice))}</td>
              <td><span class="pill ${invoice.paid ? "paid" : "open"}">${statusLabel(invoice)}</span></td>
              <td>
                <div class="row-actions">
                  <button class="action-button" type="button" data-preview="${invoice.id}" title="Aç" aria-label="Faturayı aç">↗</button>
                  <button class="action-button" type="button" data-edit-invoice="${invoice.id}" title="Düzenle" aria-label="Satış faturasını düzenle">✎</button>
                  <button class="action-button success-action" type="button" data-toggle="${invoice.id}" title="${invoice.paid ? "Bekliyor yap" : "Ödendi yap"}" aria-label="${invoice.paid ? "Bekliyor yap" : "Ödendi yap"}">✓</button>
                  <button class="action-button delete-button" type="button" data-delete-invoice="${invoice.id}" title="Sil" aria-label="Faturayı sil">×</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="7"><div class="empty-state">Satış faturası kaydı bulunamadı.</div></td></tr>`;
}

function sortNewestFirst(records, dateKey = "date") {
  return records
    .map((record, index) => ({ record, index }))
    .sort((a, b) => {
      const dateDiff = new Date(b.record[dateKey] || 0) - new Date(a.record[dateKey] || 0);
      return dateDiff || b.index - a.index;
    })
    .map((item) => item.record);
}

function sortByCreatedNewest(records) {
  return records
    .map((record, index) => ({ record, index }))
    .sort((a, b) => {
      const leftTime = a.record.createdAt ? new Date(a.record.createdAt).getTime() : a.index;
      const rightTime = b.record.createdAt ? new Date(b.record.createdAt).getTime() : b.index;
      return rightTime - leftTime || b.index - a.index;
    })
    .map((item) => item.record);
}

function paginatedRecords(records, key) {
  const totalPages = Math.max(1, Math.ceil(records.length / tablePageSize));
  tablePages[key] = Math.min(Math.max(tablePages[key] || 1, 1), totalPages);
  const start = (tablePages[key] - 1) * tablePageSize;
  return records.slice(start, start + tablePageSize);
}

function renderPagination(container, key, total) {
  if (!container) return;
  const totalPages = Math.max(1, Math.ceil(total / tablePageSize));
  if (total <= tablePageSize) {
    container.innerHTML = total ? `<span>${total} kayıt</span>` : "";
    return;
  }
  const start = (tablePages[key] - 1) * tablePageSize + 1;
  const end = Math.min(tablePages[key] * tablePageSize, total);
  container.innerHTML = `
    <span>${start}-${end} / ${total} kayıt</span>
    <div class="pagination-actions">
      <button class="secondary-button" type="button" data-pagination="${key}" data-page="${tablePages[key] - 1}" ${
        tablePages[key] <= 1 ? "disabled" : ""
      }>Önceki</button>
      <strong>Sayfa ${tablePages[key]} / ${totalPages}</strong>
      <button class="secondary-button" type="button" data-pagination="${key}" data-page="${tablePages[key] + 1}" ${
        tablePages[key] >= totalPages ? "disabled" : ""
      }>Sonraki</button>
    </div>
  `;
}

function truncateText(value, maxLength = 20) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text || "-";
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}

function quoteTotal(quote) {
  return (quote.lines || []).reduce((sum, line) => sum + line.subtotal + line.vatAmount, 0);
}

function quoteSubtotal(quote) {
  return (quote.lines || []).reduce((sum, line) => sum + line.subtotal, 0);
}

function quoteVatTotal(quote) {
  return (quote.lines || []).reduce((sum, line) => sum + line.vatAmount, 0);
}

function quoteStatusLabel(quote) {
  const labels = {
    draft: "Hazırlanıyor",
    sent: "Gönderildi",
    accepted: "Kabul Edildi",
    rejected: "Reddedildi",
  };
  return labels[quote.status] || "Hazırlanıyor";
}

function quoteStatusClass(quote) {
  if (quote.status === "accepted") return "paid";
  if (quote.status === "rejected") return "overdue";
  return "open";
}

function renderQuotes() {
  const query = normalizeSearch(els.quoteSearch?.value || "");
  const quotes = sortNewestFirst(
    (data.quotes || []).filter((quote) => {
      const customer = getCustomer(quote.customerId)?.name || "";
      return normalizeSearch(`${quote.number} ${customer} ${quote.note || ""} ${quoteStatusLabel(quote)}`).includes(query);
    }),
  );
  const visibleQuotes = paginatedRecords(quotes, "quotes");
  renderPagination(els.quotePagination, "quotes", quotes.length);

  els.quoteTable.innerHTML = quotes.length
    ? visibleQuotes
        .map((quote) => {
          const customer = getCustomer(quote.customerId);
          return `
            <tr>
              <td>${quote.number}</td>
              <td>${customer?.name || "Cari silinmiş"}</td>
              <td>${shortDate(quote.date)}</td>
              <td>${shortDate(quote.validUntil)}</td>
              <td title="${quote.note || ""}">${truncateText(quote.note, 20)}</td>
              <td>${money(quoteTotal(quote))}</td>
              <td>${
                quote.screenshot
                  ? `<button class="image-thumb-button" type="button" data-view-image="${quote.id}" title="Görseli aç"><img class="quote-screenshot-thumb" src="${quote.screenshot}" alt="Ekran görüntüsü" /></button>`
                  : "-"
              }</td>
              <td><span class="pill ${quoteStatusClass(quote)}">${quoteStatusLabel(quote)}</span></td>
              <td>
                <div class="row-actions">
                  <button class="action-button" type="button" data-preview-quote="${quote.id}" title="Aç" aria-label="Fiyat teklifini aç">↗</button>
                  <button class="action-button" type="button" data-repeat-quote="${quote.id}" title="Tekrarla" aria-label="Fiyat teklifini tekrarla">⧉</button>
                  <button class="action-button" type="button" data-edit-quote="${quote.id}" title="Düzenle" aria-label="Fiyat teklifini düzenle">✎</button>
                  <button class="action-button delete-button" type="button" data-delete-quote="${quote.id}" title="Sil" aria-label="Fiyat teklifini sil">×</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="9"><div class="empty-state">Fiyat teklifi kaydı bulunamadı.</div></td></tr>`;
}

function statusLabel(invoice) {
  if (invoice.status === "cancelled") return "İptal";
  if (invoice.paid || invoice.status === "paid") return "Ödendi";
  return "Bekliyor";
}

function renderExpenses() {
  const query = normalizeSearch(els.expenseSearch.value);
  const expenses = sortNewestFirst(
    data.expenses.filter((expense) => {
      const searchable = [expense.title, expense.category, expense.date, expense.amount, expense.status, expense.note].join(" ");
      return normalizeSearch(searchable).includes(query);
    }),
  );
  const visibleExpenses = paginatedRecords(expenses, "expenses");
  renderPagination(els.expensePagination, "expenses", expenses.length);

  els.expenseTable.innerHTML = expenses.length
    ? visibleExpenses
        .map(
          (expense) => `
            <tr>
              <td>${expense.title}</td>
              <td>${expense.category}</td>
              <td>${shortDate(expense.date)}</td>
              <td>${money(expense.amount)}</td>
              <td>
                <div class="row-actions">
                  <button class="action-button" type="button" data-preview-expense="${expense.id}" title="Aç" aria-label="Alış faturasını aç">↗</button>
                  <button class="action-button" type="button" data-edit-expense="${expense.id}" title="Düzenle" aria-label="Alış faturasını düzenle">✎</button>
                  <button class="action-button delete-button" type="button" data-delete-expense="${expense.id}" title="Sil" aria-label="Alış faturasını sil">×</button>
                </div>
              </td>
            </tr>
          `,
        )
        .join("")
    : `<tr><td colspan="5"><div class="empty-state">${query ? "Aramaya uygun alış faturası bulunamadı." : "Alış faturası kaydı yok."}</div></td></tr>`;
}

function renderCustomers() {
  const query = normalizeSearch(els.customerSearch?.value || "");
  const customers = sortByCreatedNewest(data.customers.filter((customer) => {
    const searchable = [
      customer.code,
      customer.name,
      customer.kind === "supplier" ? "Tedarikçi" : "Müşteri",
      customer.email,
      customer.phone,
      customer.address,
      customer.tax,
      customer.taxOffice,
    ].join(" ");
    return normalizeSearch(searchable).includes(query);
  }));
  const visibleCustomers = paginatedRecords(customers, "customers");
  renderPagination(els.customerPagination, "customers", customers.length);

  els.customerList.innerHTML = customers.length
    ? visibleCustomers
        .map(
          (customer) => {
            const balance = customerBalanceStatus(customer.id);
            return `
            <article class="customer-card">
              <div>
                <strong>${customer.code || "-"} · ${customer.name}</strong>
                <span>${customer.kind === "supplier" ? "Tedarikçi" : "Müşteri"} · ${customer.email || "E-posta yok"}</span>
                <span>${customerSummaryInfo(customer)}</span>
                <span class="customer-balance ${balance.className}">
                  <strong>Bakiye:</strong> ${money(balance.amount)} · ${balance.label}
                </span>
              </div>
              <div class="row-actions">
                <button class="action-button" type="button" data-edit-customer="${customer.id}" title="Düzenle" aria-label="Cari hesabı düzenle">✎</button>
                <button class="action-button delete-button" type="button" data-delete-customer="${customer.id}" title="Sil" aria-label="Cari hesabı sil">×</button>
              </div>
            </article>
          `;
          },
        )
        .join("")
    : `<div class="empty-state">${query ? "Aramaya uygun cari hesap bulunamadı." : "Cari hesap yok."}</div>`;
}

function trackingStatusLabel(status) {
  const labels = {
    pending: "Takipte",
    called: "Arandı",
    proposal: "Teklif Verildi",
    done: "Tamamlandı",
  };
  return labels[status] || "Takipte";
}

function trackingStatusClass(status) {
  if (status === "done") return "paid";
  if (status === "proposal" || status === "called") return "open";
  return "overdue";
}

function trackingQuoteNotes() {
  return [...document.querySelectorAll("[data-tracking-quote-note]")].reduce((notes, input) => {
    const quoteId = input.dataset.trackingQuoteNote;
    const note = input.value.trim();
    if (quoteId && note) notes[quoteId] = note;
    return notes;
  }, {});
}

function renderTrackingCustomerQuotes(savedNotes = {}) {
  if (!els.trackingQuoteList) return;
  const customerId = els.trackingCustomer?.value || "";
  if (!customerId) {
    els.trackingQuoteList.innerHTML = `<div class="empty-state compact">Müşteri seçince teklifleri burada görünür.</div>`;
    return;
  }

  const quotes = sortNewestFirst((data.quotes || []).filter((quote) => quote.customerId === customerId));
  els.trackingQuoteList.innerHTML = quotes.length
    ? `
      <div class="tracking-quotes-title">Müşterinin Teklifleri</div>
      ${quotes
        .map(
          (quote) => `
            <div class="tracking-quote-row">
              <div>
                <strong>${quote.number}</strong>
                <span>${shortDate(quote.date)} · ${money(quoteTotal(quote))} · ${quoteStatusLabel(quote)}</span>
              </div>
              <input
                type="text"
                maxlength="120"
                data-tracking-quote-note="${quote.id}"
                value="${escapeHtml(savedNotes[quote.id] || "")}"
                placeholder="Bu teklif için not"
              />
            </div>
          `,
        )
        .join("")}
    `
    : `<div class="empty-state compact">Bu müşteriye ait fiyat teklifi yok.</div>`;
}

function trackingNoteSummary(item) {
  const quoteNotes = Object.entries(item.quoteNotes || {});
  const quoteNoteText = quoteNotes
    .map(([quoteId, note]) => {
      const quote = (data.quotes || []).find((record) => record.id === quoteId);
      return `${quote?.number || "Teklif"}: ${note}`;
    })
    .join(" | ");
  return escapeHtml([item.note, quoteNoteText].filter(Boolean).join(" | ") || "-");
}

function renderCustomerTracking() {
  if (!els.trackingTable) return;
  const query = normalizeSearch(els.trackingSearch?.value || "");
  const rows = sortNewestFirst((data.tracking || []), "date").filter((item) => {
    const customer = getCustomer(item.customerId);
    const searchable = [
      customer?.code,
      customer?.name,
      customer?.phone,
      item.date,
      item.nextDate,
      trackingStatusLabel(item.status),
      item.note,
      Object.values(item.quoteNotes || {}).join(" "),
    ].join(" ");
    return normalizeSearch(searchable).includes(query);
  });
  const visibleRows = paginatedRecords(rows, "tracking");
  renderPagination(els.trackingPagination, "tracking", rows.length);

  els.trackingTable.innerHTML = rows.length
    ? visibleRows
        .map((item) => {
          const customer = getCustomer(item.customerId);
          return `
            <tr>
              <td>
                <strong>${customer?.name || "Cari silinmiş"}</strong>
                <span class="muted">${customer?.code || "-"}${customer?.phone ? ` · ${customer.countryCode || ""} ${customer.phone}` : ""}</span>
              </td>
              <td>${item.date ? shortDate(item.date) : "-"}</td>
              <td>${item.nextDate ? shortDate(item.nextDate) : "-"}</td>
              <td><span class="pill ${trackingStatusClass(item.status)}">${trackingStatusLabel(item.status)}</span></td>
              <td>${trackingNoteSummary(item)}</td>
              <td>
                <div class="row-actions">
                  <button class="action-button" type="button" data-edit-tracking="${item.id}" title="Düzenle" aria-label="Müşteri takibini düzenle">✎</button>
                  <button class="action-button delete-button" type="button" data-delete-tracking="${item.id}" title="Sil" aria-label="Müşteri takibini sil">×</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="6"><div class="empty-state">${query ? "Aramaya uygun takip kaydı bulunamadı." : "Müşteri takip kaydı yok."}</div></td></tr>`;
}

function resetTrackingForm() {
  editingTrackingId = null;
  els.trackingForm.reset();
  els.trackingFormTitle.textContent = "Müşteri Takip Ekle";
  els.trackingSaveBtn.textContent = "Takibi Kaydet";
  els.trackingDate.value = today();
  renderTrackingCustomerQuotes();
}

function editTracking(id) {
  const item = (data.tracking || []).find((record) => record.id === id);
  if (!item) return;
  editingTrackingId = id;
  renderSelects();
  els.trackingFormTitle.textContent = "Müşteri Takip Düzenle";
  els.trackingSaveBtn.textContent = "Güncelle";
  els.trackingCustomer.value = item.customerId || "";
  els.trackingDate.value = item.date || today();
  els.trackingNextDate.value = item.nextDate || "";
  els.trackingStatus.value = item.status || "pending";
  els.trackingNote.value = item.note || "";
  renderTrackingCustomerQuotes(item.quoteNotes || {});
  els.trackingFormDialog.showModal();
}

function customerDebtTotal(customerId) {
  return customerBalanceStatus(customerId).debtAmount;
}

function customerBalanceStatus(customerId) {
  const customer = getCustomer(customerId);
  const movements = buildCustomerMovements(customerId);
  const debit = movements.reduce((sum, movement) => sum + movement.debit, 0);
  const credit = movements.reduce((sum, movement) => sum + movement.credit, 0);
  const balance = customer?.kind === "supplier" ? credit - debit : debit - credit;
  const roundedBalance = Math.round(balance * 100) / 100;

  if (Math.abs(roundedBalance) < 0.01) {
    return {
      amount: 0,
      className: "settled",
      debtAmount: 0,
      label: "Bakiye yok",
    };
  }

  if (roundedBalance > 0) {
    return {
      amount: roundedBalance,
      className: "debit",
      debtAmount: roundedBalance,
      label: customer?.kind === "supplier" ? "Ödenecek" : "Borçlu",
    };
  }

  return {
    amount: Math.abs(roundedBalance),
    className: "credit",
    debtAmount: 0,
    label: "Alacaklı",
  };
}

function customerSummaryInfo(customer) {
  return [
    customer.email || "E-posta yok",
    customer.phone ? `${customer.countryCode || "+90"} ${customer.phone}` : "Telefon yok",
    customer.address,
    customer.tax ? `Vergi No: ${customer.tax}` : "",
    customer.taxOffice ? `Vergi Dairesi: ${customer.taxOffice}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function renderCustomerMovements() {
  const selectedCustomerId = els.movementCustomerFilter?.value || "";
  const query = normalizeSearch(els.movementSearch?.value || "");
  if (!selectedCustomerId) {
    els.movementSummary.innerHTML = [
      ["Toplam Borç", money(0)],
      ["Toplam Alacak", money(0)],
      ["Bakiye", money(0)],
    ]
      .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
      .join("");
    els.movementTable.innerHTML = `<tr><td colspan="10"><div class="empty-state">Cari hesap seçin.</div></td></tr>`;
    return;
  }
  const movements = buildCustomerMovements(selectedCustomerId).filter((movement) => {
    const searchable = [
      movement.customerCode,
      movement.customerName,
      movement.type,
      movement.description,
      movement.status,
      movement.date,
    ].join(" ");
    return normalizeSearch(searchable).includes(query);
  });

  let runningBalance = 0;
  const rows = movements.map((movement) => {
    runningBalance += movement.debit - movement.credit;
    return { ...movement, balance: runningBalance };
  });

  const debitTotal = rows.reduce((sum, movement) => sum + movement.debit, 0);
  const creditTotal = rows.reduce((sum, movement) => sum + movement.credit, 0);
  const balance = debitTotal - creditTotal;

  els.movementSummary.innerHTML = [
    ["Toplam Borç", money(debitTotal)],
    ["Toplam Alacak", money(creditTotal)],
    ["Bakiye", money(balance)],
  ]
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");

  els.movementTable.innerHTML = rows.length
    ? rows
        .map(
          (movement) => `
            <tr>
              <td>${shortDate(movement.date)}</td>
              <td>${movement.customerCode || "-"}</td>
              <td>${movement.customerName || "-"}</td>
              <td>${movement.type}</td>
              <td>${movement.description || "-"}</td>
              <td>${movement.debit ? money(movement.debit) : "-"}</td>
              <td>${movement.credit ? money(movement.credit) : "-"}</td>
              <td>${money(movement.balance)}</td>
              <td><span class="pill ${movement.statusClass}">${movement.status}</span></td>
              <td>${movementActionButton(movement)}</td>
            </tr>
          `,
        )
        .join("")
    : `<tr><td colspan="10"><div class="empty-state">${query ? "Aramaya uygun cari hareket bulunamadı." : "Cari hareket kaydı yok."}</div></td></tr>`;
}

function movementActionButton(movement) {
  if (movement.sourceType === "invoice") {
    return `<button class="action-button" type="button" data-preview="${movement.sourceId}" title="Aç" aria-label="Faturayı aç">↗</button>`;
  }
  if (movement.sourceType === "expense") {
    return `<button class="action-button" type="button" data-preview-expense="${movement.sourceId}" title="Aç" aria-label="Alış faturasını aç">↗</button>`;
  }
  if (movement.sourceType === "receipt") {
    return `<button class="action-button" type="button" data-print-receipt="${movement.sourceId}" title="Aç" aria-label="Tahsilat makbuzunu aç">↗</button>`;
  }
  return "";
}

function renderReceipts() {
  const query = normalizeSearch(els.receiptSearch?.value || "");
  const receipts = sortNewestFirst(
    (data.receipts || []).filter((receipt) => {
      const customer = getCustomer(receipt.customerId);
      const invoice = data.invoices.find((item) => item.id === receipt.invoiceId);
      const searchable = [
        receipt.date,
        customer?.code,
        customer?.name,
        invoice?.number,
        receipt.method,
        receipt.amount,
        receipt.note,
      ].join(" ");
      return normalizeSearch(searchable).includes(query);
    }),
  );
  const visibleReceipts = paginatedRecords(receipts, "receipts");
  renderPagination(els.receiptPagination, "receipts", receipts.length);

  els.receiptTable.innerHTML = receipts.length
    ? visibleReceipts
        .map((receipt) => {
          const customer = getCustomer(receipt.customerId);
          const invoice = data.invoices.find((item) => item.id === receipt.invoiceId);
          return `
            <tr>
              <td>${shortDate(receipt.date)}</td>
              <td>${customer?.name || "Cari silinmiş"}</td>
              <td>${invoice?.number || "-"}</td>
              <td>${receipt.method || "Banka"}</td>
              <td>${money(receipt.amount)}</td>
              <td>${receipt.note || "-"}</td>
              <td>
                <div class="row-actions">
                  <button class="action-button" type="button" data-print-receipt="${receipt.id}" title="Yazdır" aria-label="Tahsilat makbuzunu yazdır">⎙</button>
                  <button class="action-button" type="button" data-edit-receipt="${receipt.id}" title="Düzenle" aria-label="Tahsilatı düzenle">✎</button>
                  <button class="action-button delete-button" type="button" data-delete-receipt="${receipt.id}" title="Sil" aria-label="Tahsilatı sil">×</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="7"><div class="empty-state">${query ? "Aramaya uygun tahsilat bulunamadı." : "Tahsilat kaydı yok."}</div></td></tr>`;
}

function renderReceiptInvoiceOptions() {
  if (!els.receiptInvoice) return;
  const customerId = els.receiptCustomer.value;
  const invoices = data.invoices.filter((invoice) => !isReturnInvoice(invoice) && (!customerId || invoice.customerId === customerId));
  els.receiptInvoice.innerHTML = [
    `<option value="">Fatura seçmeden tahsilat</option>`,
    ...invoices.map((invoice) => {
      const openAmount = Math.max(0, totalInvoice(invoice) - getInvoiceReceiptTotal(invoice.id, editingReceiptId));
      return `<option value="${invoice.id}">${invoice.number} · ${money(openAmount || totalInvoice(invoice))}</option>`;
    }),
  ].join("");
}

function getInvoiceReceiptTotal(invoiceId, excludedReceiptId = "") {
  return (data.receipts || [])
    .filter((receipt) => receipt.invoiceId === invoiceId && receipt.id !== excludedReceiptId)
    .reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);
}

function getCollectedTotal(records = data.invoices, receipts = data.receipts || []) {
  const invoiceIds = new Set(records.map((invoice) => invoice.id));
  const receiptTotal = receipts
    .filter((receipt) => !receipt.invoiceId || invoiceIds.has(receipt.invoiceId))
    .reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);
  const paidWithoutReceiptTotal = data.invoices
    .filter(
      (invoice) =>
        invoiceIds.has(invoice.id) &&
        invoice.paid &&
        !(data.receipts || []).some((receipt) => receipt.invoiceId === invoice.id),
    )
    .reduce((sum, invoice) => sum + totalInvoice(invoice), 0);
  return receiptTotal + paidWithoutReceiptTotal;
}

function buildCustomerMovements(customerId = "") {
  const movements = [];

  data.invoices.forEach((invoice) => {
    const customer = getCustomer(invoice.customerId);
    if (!customer || (customerId && customer.id !== customerId)) return;
    const amount = totalInvoice(invoice);
    const isReturn = isReturnInvoice(invoice);
    movements.push({
      date: invoice.date,
      customerCode: customer.code,
      customerName: customer.name,
      type: isReturn ? "İade Faturası" : "Satış Faturası",
      description: invoice.number,
      debit: isReturn ? 0 : amount,
      credit: isReturn ? amount : 0,
      status: statusLabel(invoice),
      statusClass: invoice.paid ? "paid" : "open",
      sourceType: "invoice",
      sourceId: invoice.id,
    });
    if (invoice.paid) {
      const hasLinkedReceipt = (data.receipts || []).some((receipt) => receipt.invoiceId === invoice.id);
      if (hasLinkedReceipt) return;
      movements.push({
        date: invoice.date,
        customerCode: customer.code,
        customerName: customer.name,
        type: isReturn ? "İade Ödemesi" : "Tahsilat",
        description: invoice.number,
        debit: isReturn ? amount : 0,
        credit: isReturn ? 0 : amount,
        status: "Ödendi",
        statusClass: "paid",
        sourceType: "invoice",
        sourceId: invoice.id,
      });
    }
  });

  (data.receipts || []).forEach((receipt) => {
    const customer = getCustomer(receipt.customerId);
    if (!customer || (customerId && customer.id !== customerId)) return;
    const invoice = data.invoices.find((item) => item.id === receipt.invoiceId);
    movements.push({
      date: receipt.date,
      customerCode: customer.code,
      customerName: customer.name,
      type: "Tahsilat",
      description: receipt.note || invoice?.number || receipt.method || "Tahsilat",
      debit: 0,
      credit: Number(receipt.amount) || 0,
      status: "Tahsil edildi",
      statusClass: "paid",
      sourceType: "receipt",
      sourceId: receipt.id,
    });
  });

  data.expenses.forEach((expense) => {
    const supplier = findCustomerByName(expense.category);
    if (!supplier || (customerId && supplier.id !== customerId)) return;
    const amount = Number(expense.amount) || 0;
    movements.push({
      date: expense.date,
      customerCode: supplier.code,
      customerName: supplier.name,
      type: "Alış Faturası",
      description: expense.title,
      debit: 0,
      credit: amount,
      status: statusLabel({ status: expense.status, paid: expense.status === "paid" }),
      statusClass: expense.status === "paid" ? "paid" : "open",
      sourceType: "expense",
      sourceId: expense.id,
    });
    if (expense.status === "paid") {
      movements.push({
        date: expense.date,
        customerCode: supplier.code,
        customerName: supplier.name,
        type: "Ödeme",
        description: expense.title,
        debit: amount,
        credit: 0,
        status: "Ödendi",
        statusClass: "paid",
        sourceType: "expense",
        sourceId: expense.id,
      });
    }
  });

  (data.debts || []).forEach((debt) => {
    const customer = findCustomerForDebt(debt);
    const matchesSelection =
      !customerId ||
      customer?.id === customerId ||
      normalizeSearch(debt.code || "") === normalizeSearch(getCustomer(customerId)?.code || "") ||
      normalizeSearch(debt.name || "") === normalizeSearch(getCustomer(customerId)?.name || "");
    if (!matchesSelection) return;
    movements.push({
      date: debt.createdAt?.slice(0, 10) || debt.due || today(),
      customerCode: debt.code || customer?.code || "",
      customerName: debt.name || customer?.name || "",
      type: "Borç Takip",
      description: debt.note || "Borç kaydı",
      debit: Number(debt.amount) || 0,
      credit: debt.status === "paid" ? Number(debt.amount) || 0 : 0,
      status: debtStatusLabel(debt),
      statusClass: debtStatusClass(debt),
    });
  });

  return movements.sort((a, b) => {
    const dateCompare = new Date(a.date) - new Date(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.type.localeCompare(b.type, "tr");
  });
}

function findCustomerByName(name) {
  const normalized = normalizeSearch(name);
  return data.customers.find((customer) => normalizeSearch(customer.name) === normalized);
}

function findOrCreateCustomerForInvoice(rowData, kind) {
  const name = rowData.customerName || (kind === "supplier" ? "CSV Tedarikçi" : "CSV Müşteri");
  const code = rowData.customerCode || "";
  let customer = data.customers.find((item) => {
    return (code && normalizeSearch(item.code) === normalizeSearch(code)) || normalizeSearch(item.name) === normalizeSearch(name);
  });
  if (customer) return customer;

  customer = {
    id: crypto.randomUUID(),
    code: code || nextCustomerCode(kind),
    kind,
    name,
    email: "",
    countryCode: "+90",
    phone: "",
    tax: "",
    taxOffice: "",
  };
  data.customers.push(customer);
  return customer;
}

function renderProducts() {
  els.bulkEditProductsBtn.textContent = bulkProductEditMode ? "Tümünü Kaydet" : "Tümünü Düzenle";
  const query = normalizeSearch(els.productSearch.value);
  const products = sortByCreatedNewest(data.products.filter((product) => {
    const searchable = [
      product.code,
      product.name,
      product.unit,
      product.cost,
      product.margin,
      product.price,
      product.stock,
    ].join(" ");
    return normalizeSearch(searchable).includes(query);
  }));
  const visibleProducts = paginatedRecords(products, "products");
  renderPagination(els.productPagination, "products", products.length);

  els.productTable.innerHTML = products.length
    ? visibleProducts
        .map((product) => (bulkProductEditMode ? renderEditableProductRow(product) : renderProductRow(product)))
        .join("")
    : `<tr><td colspan="8"><div class="empty-state">${query ? "Aramaya uygun ürün bulunamadı." : "Ürün kaydı yok."}</div></td></tr>`;
}

function renderDebts() {
  const query = normalizeSearch(els.debtSearch.value);
  const debts = (data.debts || []).filter((debt) => {
    const searchable = [debt.name, debt.contact, debt.relatedPerson, debt.phone, debt.amount, debt.note, debt.status].join(" ");
    return normalizeSearch(searchable).includes(query);
  });
  els.selectAllDebts.checked = debts.length > 0 && debts.every((debt) => selectedDebtIds.has(debt.id));
  const openDebtTotal = debts
    .filter((debt) => debt.status !== "paid")
    .reduce((sum, debt) => sum + (Number(debt.amount) || 0), 0);
  const paidDebtTotal = debts
    .filter((debt) => debt.status === "paid")
    .reduce((sum, debt) => sum + (Number(debt.amount) || 0), 0);

  els.debtTable.innerHTML = debts.length
    ? debts
        .map(
          (debt) => `
            <tr>
              <td><input class="debt-select" type="checkbox" data-debt-select="${debt.id}" ${selectedDebtIds.has(debt.id) ? "checked" : ""} /></td>
              <td>${debt.name || "-"}</td>
              <td>${debt.contact || debt.relatedPerson || "-"}</td>
              <td>${formatDebtPhone(debt) || "-"}</td>
              <td>${money(debt.amount)}</td>
              <td>${debt.note || "-"}</td>
              <td><span class="pill ${debtStatusClass(debt)}">${debtStatusLabel(debt)}</span></td>
              <td>
                <div class="row-actions">
                  <button class="action-button whatsapp-action" type="button" data-whatsapp-debt="${debt.id}" title="WhatsApp" aria-label="WhatsApp mesajı gönder">☎</button>
                  <button class="action-button edit-button" type="button" data-edit-debt="${debt.id}" title="Düzenle" aria-label="Borç kaydını düzenle">✎</button>
                  <button class="action-button success-action" type="button" data-toggle-debt-paid="${debt.id}" title="${debt.status === "paid" ? "Bekliyor yap" : "Ödendi yap"}" aria-label="${debt.status === "paid" ? "Bekliyor yap" : "Ödendi yap"}">✓</button>
                  <button class="action-button delete-button" type="button" data-delete-debt="${debt.id}" title="Sil" aria-label="Borç kaydını sil">×</button>
                </div>
              </td>
            </tr>
          `,
        )
        .join("")
    : `<tr><td colspan="8"><div class="empty-state">${query ? "Aramaya uygun borçlu cari bulunamadı." : "Borç kaydı yok."}</div></td></tr>`;

  els.debtTotalBar.innerHTML = `
    <div><span>${query ? "Arama sonucu bekleyen toplam" : "Bekleyen borç toplamı"}</span><strong>${money(openDebtTotal)}</strong></div>
    <div><span>${query ? "Arama sonucu ödenen toplam" : "Ödenen toplam"}</span><strong>${money(paidDebtTotal)}</strong></div>
  `;
}

function formatDebtPhone(debt) {
  if (!debt.phone) return "";
  return `${debt.countryCode || "+90"} ${debt.phone}`;
}

function renderBankAccounts() {
  const accounts = data.bankAccounts || [];
  els.bankList.innerHTML = accounts.length
    ? accounts
        .map(
          (account) => `
            <article class="customer-card">
              <div>
                <strong>${account.bankName} · ${account.accountName}</strong>
                <span>${account.iban}</span>
                <span>${account.branch || "Şube yok"} · ${account.currency || "TRY"} · ${account.note || "Açıklama yok"}</span>
              </div>
              <div class="row-actions">
                <button class="action-button" type="button" data-edit-bank="${account.id}" title="Düzenle" aria-label="Banka hesabını düzenle">✎</button>
                <button class="action-button delete-button" type="button" data-delete-bank="${account.id}" title="Sil" aria-label="Banka hesabını sil">×</button>
              </div>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">Banka hesabı yok.</div>`;
}

function renderCompanyLogo() {
  if (!els.logoPreviewBox) return;
  els.logoPreviewBox.innerHTML = data.company?.logo
    ? `<img src="${data.company.logo}" alt="Firma logosu" />`
    : `<span>Logo yok</span>`;
  if (!els.companyForm) return;
  els.companyName.value = data.company?.name || "";
  els.companyPhone.value = data.company?.phone || "";
  els.companyEmail.value = data.company?.email || "";
  els.companyWebsite.value = data.company?.website || "";
  els.companyAddress.value = data.company?.address || "";
  els.companyTax.value = data.company?.tax || "";
  els.companyTaxOffice.value = data.company?.taxOffice || "";
}

function renderUsers() {
  const users = data.users || [];
  els.userList.innerHTML = users.length
    ? users
        .map(
          (user) => `
            <article class="customer-card">
              <div>
                <strong>${user.fullName || user.username}</strong>
                <span>${user.username || "-"} · ${user.email || "E-posta yok"}</span>
                <span>${user.role || "Görüntüleme"} · ${user.status || "Aktif"}</span>
              </div>
              <div class="row-actions">
                <button class="action-button" type="button" data-edit-user="${user.id}" title="Düzenle" aria-label="Kullanıcıyı düzenle">✎</button>
                <button class="action-button delete-button" type="button" data-delete-user="${user.id}" title="Sil" aria-label="Kullanıcıyı sil">×</button>
              </div>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">Kullanıcı hesabı yok.</div>`;
}

function debtStatusLabel(debt) {
  if (debt.status === "paid") return "Ödendi";
  return "Bekliyor";
}

function debtStatusClass(debt) {
  if (debt.status === "paid") return "paid";
  return "open";
}

function findCustomerForDebt(debt) {
  const code = normalizeSearch(debt.code || "");
  const name = normalizeSearch(debt.name || "");
  return data.customers.find((customer) => {
    return normalizeSearch(customer.code || "") === code || normalizeSearch(customer.name || "") === name;
  });
}

function buildDebtReminderMessage(debt) {
  return personalizeDebtMessage(buildBulkDebtReminderTemplate(), debt);
}

function buildBulkDebtReminderTemplate() {
  const bankInfo = buildBankAccountMessage();
  const template = data.messageTemplates?.debtBulk || defaultBulkDebtMessageTemplate;
  return `${template.trim()}${bankInfo}`;
}

function openBulkMessageSettings() {
  data.messageTemplates = data.messageTemplates || {};
  els.bulkMessageTemplate.value = data.messageTemplates.debtBulk || defaultBulkDebtMessageTemplate;
  els.bulkMessageSettingsDialog.showModal();
  els.bulkMessageTemplate.focus();
}

function saveBulkMessageSettings(event) {
  event.preventDefault();
  const template = els.bulkMessageTemplate.value.trim();
  if (!template) return;

  data.messageTemplates = data.messageTemplates || {};
  data.messageTemplates.debtBulk = template;
  saveData();
  els.bulkMessageSettingsDialog.close();
}

function buildBankAccountMessage() {
  const accounts = data.bankAccounts || [];
  if (!accounts.length) return "";

  const lines = accounts.map((account) => {
    return `${account.bankName} - ${account.accountName}\nIBAN: ${account.iban}\nPara Birimi: ${account.currency || "TRY"}`;
  });
  return `\n\nBanka hesap bilgilerimiz:\n${lines.join("\n\n")}`;
}

function openDebtWhatsappReminder(id) {
  const debt = (data.debts || []).find((item) => item.id === id);
  if (!debt) return;

  const customer = findCustomerForDebt(debt);
  pendingWhatsappRecipients = [];
  pendingWhatsappIndex = 0;
  pendingWhatsappTemplate = "";
  pendingWhatsappPhone = normalizeDebtPhone(debt) || normalizePhone(customer);
  els.whatsappMessageText.value = buildDebtReminderMessage(debt);
  els.whatsappMessageProgress.textContent = debt.name;
  els.whatsappSendBtn.textContent = "WhatsApp'a Gönder";
  els.whatsappMessageDialog.showModal();
}

function openBulkDebtWhatsappReminder() {
  const debts = getVisibleDebts();
  const selected = debts.filter((debt) => selectedDebtIds.has(debt.id));
  pendingWhatsappRecipients = selected.length ? selected : debts;
  pendingWhatsappIndex = 0;
  pendingWhatsappTemplate = buildBulkDebtReminderTemplate();
  pendingWhatsappPhone = "";

  if (!pendingWhatsappRecipients.length) {
    alert("Mesaj gönderilecek borçlu cari bulunamadı.");
    return;
  }

  prepareNextBulkWhatsappMessage();
  els.whatsappMessageDialog.showModal();
}

async function sendEditedWhatsappMessage(event) {
  event.preventDefault();
  const message = els.whatsappMessageText.value.trim();
  if (!message) return;

  if (pendingWhatsappRecipients.length) {
    await sendCurrentBulkWhatsappMessage(message);
    return;
  }

  if (pendingWhatsappPhone) {
    window.open(`https://wa.me/${pendingWhatsappPhone}?text=${encodeURIComponent(message)}`, "_blank");
    els.whatsappMessageDialog.close();
    return;
  }

  await navigator.clipboard?.writeText(message);
  alert("Bu borçlu cari için telefon bulunamadı. Mesaj panoya kopyalandı.");
  els.whatsappMessageDialog.close();
}

async function sendCurrentBulkWhatsappMessage(message) {
  const debt = pendingWhatsappRecipients[pendingWhatsappIndex];
  if (!debt) {
    finishBulkWhatsappQueue();
    return;
  }

  const customer = findCustomerForDebt(debt);
  const phone = normalizeDebtPhone(debt) || normalizePhone(customer);
  if (phone) {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  } else {
    await navigator.clipboard?.writeText(message);
    alert(`${debt.name} için telefon bulunamadı. Mesaj panoya kopyalandı.`);
  }

  pendingWhatsappIndex += 1;
  if (pendingWhatsappIndex >= pendingWhatsappRecipients.length) {
    finishBulkWhatsappQueue();
    return;
  }

  prepareNextBulkWhatsappMessage();
}

function prepareNextBulkWhatsappMessage() {
  const debt = pendingWhatsappRecipients[pendingWhatsappIndex];
  if (!debt) return;

  els.whatsappMessageText.value = personalizeDebtMessage(pendingWhatsappTemplate, debt);
  els.whatsappMessageProgress.textContent = `${pendingWhatsappIndex + 1} / ${pendingWhatsappRecipients.length} - ${debt.name}`;
  els.whatsappSendBtn.textContent =
    pendingWhatsappIndex + 1 === pendingWhatsappRecipients.length ? "Gönder ve Bitir" : "Gönder ve Sonrakine Geç";
}

function finishBulkWhatsappQueue() {
  pendingWhatsappRecipients = [];
  pendingWhatsappIndex = 0;
  pendingWhatsappTemplate = "";
  els.whatsappMessageDialog.close();
  alert("Toplu mesaj kuyruğu tamamlandı.");
}

function personalizeDebtMessage(template, debt) {
  return template
    .replaceAll("{cari}", debt.name || "")
    .replaceAll("{ilgili}", debt.contact || debt.relatedPerson || "")
    .replaceAll("{tutar}", money(debt.amount))
    .replaceAll("{kod}", debt.code || "")
    .replaceAll("{telefon}", formatDebtPhone(debt) || "");
}

function getVisibleDebts() {
  const query = normalizeSearch(els.debtSearch.value);
  return (data.debts || []).filter((debt) => {
    const searchable = [debt.name, debt.contact, debt.relatedPerson, debt.phone, debt.amount, debt.note, debt.status].join(" ");
    return normalizeSearch(searchable).includes(query);
  });
}

function normalizePhone(customer) {
  if (!customer?.phone) return "";
  const countryCode = String(customer.countryCode || "+90").replace(/\D/g, "");
  let phone = String(customer.phone).replace(/\D/g, "");
  if (phone.startsWith("0")) phone = phone.slice(1);
  if (phone.startsWith(countryCode)) return phone;
  return `${countryCode}${phone}`;
}

function normalizeDebtPhone(debt) {
  if (!debt?.phone) return "";
  const countryCode = String(debt.countryCode || "+90").replace(/\D/g, "");
  let phone = String(debt.phone).replace(/\D/g, "");
  if (phone.startsWith("0")) phone = phone.slice(1);
  if (phone.startsWith(countryCode)) return phone;
  return `${countryCode}${phone}`;
}

function renderProductRow(product) {
  return `
    <tr>
      <td>${product.code || "-"}</td>
      <td>${product.name}</td>
      <td>${money(product.cost || 0)}</td>
      <td>%${formatPercent(product.margin || 0)}</td>
      <td>${money(product.price)}</td>
      <td>${product.unit || "Adet"}</td>
      <td>${product.stock}</td>
      <td>
        <div class="row-actions">
          <button class="action-button" type="button" data-edit-product="${product.id}" title="Düzenle" aria-label="Stok kartını düzenle">✎</button>
          <button class="action-button delete-button" type="button" data-delete-product="${product.id}" title="Sil" aria-label="Stok kartını sil">×</button>
        </div>
      </td>
    </tr>
  `;
}

function renderEditableProductRow(product) {
  return `
    <tr data-product-row="${product.id}">
      <td><input class="table-input" data-field="code" value="${escapeHtml(product.code || "")}" /></td>
      <td><input class="table-input" data-field="name" value="${escapeHtml(product.name || "")}" /></td>
      <td><input class="table-input money-input" data-field="cost" type="text" inputmode="decimal" value="${numberText(product.cost || 0)}" /></td>
      <td><input class="table-input" data-field="margin" type="number" min="0" step="0.01" value="${product.margin || 0}" /></td>
      <td><input class="table-input money-input" data-field="price" type="text" inputmode="decimal" value="${numberText(product.price || 0)}" readonly /></td>
      <td>
        <select class="table-input" data-field="unit">
          ${unitOptions(product.unit || "Adet")}
        </select>
      </td>
      <td><input class="table-input" data-field="stock" type="number" min="0" step="1" value="${product.stock || 0}" /></td>
      <td><button class="action-button delete-button" type="button" data-delete-product="${product.id}" title="Sil" aria-label="Stok kartını sil">×</button></td>
    </tr>
  `;
}

function unitOptions(selected) {
  const units = ["Adet", "Kutu", "Torba", "Paket", "Kg", "m2", "m3", "Metre", "Litre", "Saat", "Hizmet"];
  const uniqueUnits = [...new Set([selected, ...units].filter(Boolean))];
  return uniqueUnits
    .map((unit) => `<option ${unit === selected ? "selected" : ""}>${unit}</option>`)
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function ensureWidgets() {
  data.widgets = data.widgets || {};
  data.widgets.todos = Array.isArray(data.widgets.todos) ? data.widgets.todos : [];
  data.widgets.calendar = Array.isArray(data.widgets.calendar) ? data.widgets.calendar : [];
}

function openMiniTool(tool) {
  ensureWidgets();
  const isCalendar = tool === "calendar";
  const isRates = tool === "rates";
  els.miniToolPanel.classList.add("open");
  els.todoToolBtn.classList.toggle("active", tool === "todo");
  els.calendarToolBtn.classList.toggle("active", isCalendar);
  els.ratesToolBtn.classList.toggle("active", isRates);
  els.todoToolPanel.classList.toggle("is-hidden", tool !== "todo");
  els.calendarToolPanel.classList.toggle("is-hidden", !isCalendar);
  els.ratesToolPanel.classList.toggle("is-hidden", !isRates);
  els.miniToolEyebrow.textContent = isCalendar ? "Takvim" : isRates ? "TCMB" : "To do";
  els.miniToolTitle.textContent = isCalendar ? "Takvim Notları" : isRates ? "Güncel Kurlar" : "To do list";
  if (isCalendar) {
    els.calendarDate.value ||= today();
    els.calendarNote.focus();
  } else if (isRates) {
    if (!ratesLoaded) fetchRates();
  } else {
    els.todoInput.focus();
  }
}

function closeMiniTool() {
  els.miniToolPanel.classList.remove("open");
  els.todoToolBtn.classList.remove("active");
  els.calendarToolBtn.classList.remove("active");
  els.ratesToolBtn.classList.remove("active");
}

function getRatesApiUrl() {
  return location.protocol === "file:" ? "https://muhasebe-pro-one.vercel.app/api/kurlar" : "/api/kurlar";
}

function formatRate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(number);
}

function renderRates(payload) {
  const rates = Array.isArray(payload?.rates) ? payload.rates : [];
  if (!rates.length) {
    els.ratesList.innerHTML = "";
    els.ratesStatus.textContent = "Kur bilgisi bulunamadı.";
    return;
  }

  const dateText = payload.publishedAt ? `TCMB tarihi: ${payload.publishedAt}` : "TCMB güncel kur listesi";
  els.ratesStatus.textContent = dateText;
  els.ratesList.innerHTML = rates
    .map(
      (rate) => `
        <div class="mini-rate-item">
          <div>
            <strong>${escapeHtml(rate.code)}</strong>
            <span>${escapeHtml(rate.name || "")}</span>
          </div>
          <dl>
            <div><dt>Alış</dt><dd>${formatRate(rate.buying)}</dd></div>
            <div><dt>Satış</dt><dd>${formatRate(rate.selling)}</dd></div>
            <div><dt>Efektif Alış</dt><dd>${formatRate(rate.banknoteBuying)}</dd></div>
            <div><dt>Efektif Satış</dt><dd>${formatRate(rate.banknoteSelling)}</dd></div>
          </dl>
        </div>
      `,
    )
    .join("");
}

async function fetchRates() {
  els.ratesStatus.textContent = "TCMB kurları yükleniyor.";
  els.ratesList.innerHTML = "";
  els.refreshRatesBtn.disabled = true;
  try {
    const response = await fetch(`${getRatesApiUrl()}?t=${Date.now()}`);
    if (!response.ok) throw new Error("Kur bilgisi alınamadı.");
    const payload = await response.json();
    renderRates(payload);
    ratesLoaded = true;
  } catch {
    els.ratesStatus.textContent = "Kurlar alınamadı. Biraz sonra tekrar güncelleyin.";
  } finally {
    els.refreshRatesBtn.disabled = false;
  }
}

function renderWidgets() {
  ensureWidgets();

  els.todoList.innerHTML = data.widgets.todos.length
    ? data.widgets.todos
        .map(
          (todo) => `
            <div class="mini-tool-item ${todo.done ? "done" : ""}">
              <button class="mini-tool-check" type="button" data-toggle-todo="${todo.id}" aria-label="Görevi tamamla">
                ${todo.done ? "✓" : ""}
              </button>
              <span>${escapeHtml(todo.text)}</span>
              <button class="mini-tool-delete" type="button" data-delete-todo="${todo.id}" aria-label="Görevi sil">×</button>
            </div>
          `,
        )
        .join("")
    : `<p class="mini-tool-empty">Henüz görev yok.</p>`;

  const calendarRows = data.widgets.calendar
    .slice()
    .sort((left, right) => String(left.date || "").localeCompare(String(right.date || "")));

  els.calendarList.innerHTML = calendarRows.length
    ? calendarRows
        .map(
          (item) => `
            <div class="mini-tool-item">
              <strong class="mini-tool-date">${item.date ? shortDate(item.date) : "-"}</strong>
              <span>${escapeHtml(item.note)}</span>
              <button class="mini-tool-delete" type="button" data-delete-calendar="${item.id}" aria-label="Takvim notunu sil">×</button>
            </div>
          `,
        )
        .join("")
    : `<p class="mini-tool-empty">Henüz takvim notu yok.</p>`;
}

function addTodo(event) {
  event.preventDefault();
  ensureWidgets();
  const text = els.todoInput.value.trim();
  if (!text) return;
  data.widgets.todos.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
  });
  els.todoForm.reset();
  saveData();
  renderWidgets();
}

function addCalendarNote(event) {
  event.preventDefault();
  ensureWidgets();
  const date = els.calendarDate.value || today();
  const note = els.calendarNote.value.trim();
  if (!note) return;
  data.widgets.calendar.push({
    id: crypto.randomUUID(),
    date,
    note,
    createdAt: new Date().toISOString(),
  });
  els.calendarNote.value = "";
  els.calendarDate.value = date;
  saveData();
  renderWidgets();
}

function handleWidgetClick(event) {
  const todoToggleId = event.target.closest("[data-toggle-todo]")?.dataset.toggleTodo;
  const todoDeleteId = event.target.closest("[data-delete-todo]")?.dataset.deleteTodo;
  const calendarDeleteId = event.target.closest("[data-delete-calendar]")?.dataset.deleteCalendar;
  if (!todoToggleId && !todoDeleteId && !calendarDeleteId) return;

  ensureWidgets();
  if (todoToggleId) {
    data.widgets.todos = data.widgets.todos.map((todo) =>
      todo.id === todoToggleId ? { ...todo, done: !todo.done } : todo,
    );
  }
  if (todoDeleteId) {
    data.widgets.todos = data.widgets.todos.filter((todo) => todo.id !== todoDeleteId);
  }
  if (calendarDeleteId) {
    data.widgets.calendar = data.widgets.calendar.filter((item) => item.id !== calendarDeleteId);
  }
  saveData();
  renderWidgets();
}

function formatPercent(value) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function renderReports() {
  const startDate = els.reportStartDate?.value || "";
  const endDate = els.reportEndDate?.value || "";
  const invoices = data.invoices.filter((invoice) => isDateInReportRange(invoice.date, startDate, endDate));
  const expensesInRange = data.expenses.filter((expense) => isDateInReportRange(expense.date, startDate, endDate));
  const receiptsInRange = (data.receipts || []).filter((receipt) => isDateInReportRange(receipt.date, startDate, endDate));
  const debtsInRange = (data.debts || []).filter((debt) =>
    isDateInReportRange(debt.createdAt?.slice(0, 10) || debt.due, startDate, endDate, true),
  );
  const quotes = (data.quotes || []).filter((quote) => isDateInReportRange(quote.date, startDate, endDate));
  const sales = invoices.reduce((sum, invoice) => sum + totalInvoice(invoice), 0);
  const expenses = expensesInRange.reduce((sum, expense) => sum + expense.amount, 0);
  const paid = getCollectedTotal(invoices, receiptsInRange);
  const pending = sales - paid;
  const debtTotal = debtsInRange.reduce((sum, debt) => sum + debt.amount, 0);
  const acceptedQuotes = quotes.filter((quote) => quote.status === "accepted");
  const waitingQuotes = quotes.filter((quote) => quote.status !== "accepted" && quote.status !== "rejected");

  els.reportSummary.innerHTML = [
    ["Satış faturası sayısı", invoices.length],
    ["Fiyat teklifi sayısı", quotes.length],
    ["Cari hesap sayısı", data.customers.length],
    ["Ürün sayısı", data.products.length],
    ["Borç takip toplamı", money(debtTotal)],
    ["Tahsil edilen", money(paid)],
    ["Tahsilat bekleyen", money(pending)],
    ["Net durum", money(sales - expenses)],
  ]
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");

  const categories = expensesInRange.reduce((grouped, expense) => {
    grouped[expense.category] = (grouped[expense.category] || 0) + expense.amount;
    return grouped;
  }, {});
  const categoryRows = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  els.categoryReport.innerHTML = categoryRows.length
    ? categoryRows
        .map(
          ([category, amount]) => `
            <div class="activity-item">
              <strong>${category}</strong>
              <strong>${money(amount)}</strong>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-state">Tedarikçi raporu için alış faturası ekleyin.</div>`;

  els.quoteReportSummary.innerHTML = [
    ["Hazırlanan teklif", quotes.length],
    ["Onaylanan teklif", acceptedQuotes.length],
    ["Bekleyen teklif", waitingQuotes.length],
    ["Onay oranı", quotes.length ? `%${formatPercent((acceptedQuotes.length / quotes.length) * 100)}` : "%0"],
    ["Teklif toplamı", money(quotes.reduce((sum, quote) => sum + quoteTotal(quote), 0))],
    ["Onaylanan teklif toplamı", money(acceptedQuotes.reduce((sum, quote) => sum + quoteTotal(quote), 0))],
  ]
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");

  els.topQuoteCustomers.innerHTML = renderCustomerRanking(
    buildQuoteCustomerRanking(quotes),
    "Teklif kaydı yok.",
  );
  els.topOrderCustomers.innerHTML = renderCustomerRanking(
    buildCustomerRanking(invoices, totalInvoice),
    "Siparişe dönüşen satış faturası yok.",
  );
}

function isDateInReportRange(value, startDate, endDate, includeEmptyWhenNoRange = false) {
  if (!startDate && !endDate) return includeEmptyWhenNoRange || !!value;
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  if (startDate && date < new Date(startDate)) return false;
  if (endDate && date > new Date(endDate)) return false;
  return true;
}

function buildCustomerRanking(records, amountResolver) {
  const grouped = records.reduce((items, record) => {
    const customer = getCustomer(record.customerId);
    const key = record.customerId || customer?.name || "unknown";
    if (!items[key]) {
      items[key] = {
        name: customer?.name || "Cari silinmiş",
        count: 0,
        amount: 0,
      };
    }
    items[key].count += 1;
    items[key].amount += amountResolver(record);
    return items;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => b.count - a.count || b.amount - a.amount)
    .slice(0, 5);
}

function buildQuoteCustomerRanking(quotes) {
  const grouped = quotes.reduce((items, quote) => {
    const customer = getCustomer(quote.customerId);
    const key = quote.customerId || customer?.name || "unknown";
    if (!items[key]) {
      items[key] = {
        name: customer?.name || "Cari silinmiş",
        count: 0,
        acceptedCount: 0,
        waitingCount: 0,
        amount: 0,
        acceptedAmount: 0,
        isQuoteRanking: true,
      };
    }
    const total = quoteTotal(quote);
    items[key].count += 1;
    items[key].amount += total;
    if (quote.status === "accepted") {
      items[key].acceptedCount += 1;
      items[key].acceptedAmount += total;
    } else if (quote.status !== "rejected") {
      items[key].waitingCount += 1;
    }
    return items;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => b.count - a.count || b.acceptedCount - a.acceptedCount || b.amount - a.amount)
    .slice(0, 5);
}

function renderCustomerRanking(rows, emptyText) {
  return rows.length
    ? rows
        .map(
          (row) => `
            <div class="activity-item">
              <div>
                <strong>${row.name}</strong>
                ${
                  row.isQuoteRanking
                    ? `<span>${row.count} teklif · ${row.acceptedCount} onaylandı · ${row.waitingCount} bekliyor</span>`
                    : `<span>${row.count} kayıt</span>`
                }
              </div>
              <div class="ranking-amounts">
                <strong>${money(row.amount)}</strong>
                ${row.isQuoteRanking ? `<span>Onaylı: ${money(row.acceptedAmount)}</span>` : ""}
              </div>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-state">${emptyText}</div>`;
}

function renderAll() {
  renderSelects();
  renderDashboard();
  renderInvoices();
  renderQuotes();
  renderExpenses();
  renderCustomers();
  renderCustomerMovements();
  renderCustomerTracking();
  renderReceipts();
  renderProducts();
  renderDebts();
  renderBankAccounts();
  renderCompanyLogo();
  renderUsers();
  renderReports();
  renderWidgets();
}

function switchView(viewId) {
  els.views.forEach((view) => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  const activeButton = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  els.pageTitle.textContent = activeButton?.textContent.trim() || "Muhasebe Pro";
}

function createInvoice(event) {
  event.preventDefault();
  if (!data.customers.length || !data.products.length) return;

  const lines = ensureInvoiceLineProducts(
    collectInvoiceLines().filter((line) => (line.productId || line.productCode || line.productName) && line.quantity > 0),
    "sale",
  );
  if (!els.invoiceCustomer.value || !lines.length) return;

  const invoice = {
    id: crypto.randomUUID(),
    number: els.invoiceNumber.value || nextInvoiceNumber(),
    type: els.invoiceType.value,
    customerId: els.invoiceCustomer.value,
    productId: lines[0].productId,
    productName: lines[0].productName,
    quantity: lines[0].quantity,
    unitPrice: lines[0].unitPrice,
    vatRate: lines[0].vatRate,
    vatAmount: lines.reduce((sum, line) => sum + line.vatAmount, 0),
    subtotal: lines.reduce((sum, line) => sum + line.subtotal, 0),
    lines,
    date: els.invoiceDate.value,
    due: els.invoiceDue.value,
    note: els.invoiceNote.value.trim(),
    status: els.invoiceStatus.value,
    paid: els.invoiceStatus.value === "paid",
  };

  if (editingInvoiceId) {
    const currentInvoice = data.invoices.find((item) => item.id === editingInvoiceId);
    if (currentInvoice) {
      adjustStockForLines(getStoredLines(currentInvoice), invoiceStockKind(currentInvoice), "reverse");
      Object.assign(currentInvoice, invoice, { id: editingInvoiceId });
    } else {
      data.invoices.push(invoice);
    }
  } else {
    data.invoices.push(invoice);
  }
  adjustStockForLines(lines, invoiceStockKind(invoice), "apply");
  saveData();
  closeFormDialog(els.invoiceFormDialog);
  renderAll();
}

function createQuote(event) {
  event.preventDefault();
  data.quotes = data.quotes || [];
  const lines = collectQuoteLines().filter((line) => (line.productId || line.productCode || line.productName) && line.quantity > 0);
  if (!els.quoteCustomer.value || !lines.length) return;

  const quote = {
    id: crypto.randomUUID(),
    number: els.quoteNumber.value || nextQuoteNumber(),
    customerId: els.quoteCustomer.value,
    date: els.quoteDate.value || today(),
    validUntil: els.quoteValidUntil.value || addDays(7),
    status: els.quoteStatus.value,
    note: els.quoteNote.value.trim(),
    screenshot: pendingQuoteScreenshot,
    lines,
    createdAt: new Date().toISOString(),
  };

  if (editingQuoteId) {
    const currentQuote = data.quotes.find((item) => item.id === editingQuoteId);
    if (currentQuote) {
      Object.assign(currentQuote, quote, { id: editingQuoteId, createdAt: currentQuote.createdAt || quote.createdAt });
    } else {
      data.quotes.push(quote);
    }
  } else {
    data.quotes.push(quote);
  }

  saveData();
  closeFormDialog(els.quoteFormDialog);
  renderAll();
}

function createExpense(event) {
  event.preventDefault();
  const lines = ensureInvoiceLineProducts(
    collectExpenseLines().filter((line) => (line.productId || line.productCode || line.productName) && line.quantity > 0),
    "purchase",
  );
  if (!els.expenseCategory.value || !lines.length) return;
  const amount = lines.reduce((sum, line) => sum + line.subtotal + line.vatAmount, 0);
  const expense = {
    id: crypto.randomUUID(),
    title: els.expenseTitle.value.trim(),
    date: els.expenseDate.value,
    category: els.expenseCategory.value,
    amount,
    status: els.expenseStatus.value,
    note: els.expenseNote.value.trim(),
    lines,
    type: "purchaseInvoice",
  };

  if (editingExpenseId) {
    const currentExpense = data.expenses.find((item) => item.id === editingExpenseId);
    if (currentExpense) {
      adjustStockForLines(getStoredLines(currentExpense), "purchase", "reverse");
      Object.assign(currentExpense, expense, { id: editingExpenseId });
    } else {
      data.expenses.push(expense);
    }
  } else {
    data.expenses.push(expense);
  }
  adjustStockForLines(lines, "purchase", "apply");
  saveData();
  closeFormDialog(els.expenseFormDialog);
  renderAll();
}

function adjustStockForLines(lines, kind, mode) {
  lines.forEach((line) => {
    const product = getProduct(line.productId);
    if (!product) return;

    const quantity = parseNumber(line.quantity);
    const multiplier = kind === "sale" ? -1 : 1;
    const direction = mode === "reverse" ? -1 : 1;
    product.stock = Math.max(0, Number(product.stock || 0) + quantity * multiplier * direction);
  });
}

function getStoredLines(record) {
  if (record?.lines?.length) return record.lines;
  if (record?.productId) return [record];
  return [];
}

function editQuote(id) {
  const quote = (data.quotes || []).find((item) => item.id === id);
  if (!quote) return;

  editingQuoteId = id;
  renderSelects();
  els.quoteFormTitle.textContent = "Fiyat Teklifini Düzenle";
  els.quoteSaveBtn.textContent = "Güncelle";
  els.quoteNumber.value = quote.number || "";
  els.quoteCustomer.value = quote.customerId || "";
  els.quoteDate.value = quote.date || today();
  els.quoteValidUntil.value = quote.validUntil || addDays(7);
  els.quoteStatus.value = quote.status || "draft";
  els.quoteNote.value = quote.note || "";
  pendingQuoteScreenshot = quote.screenshot || "";
  renderQuoteScreenshotPreview();
  els.quoteLines.innerHTML = (quote.lines?.length ? quote.lines : []).map((line, index) => createQuoteLineFromData(line, index === 0)).join("");
  if (!els.quoteLines.innerHTML) resetQuoteLines();
  updateQuoteTotals();
  els.quoteFormDialog.showModal();
}

function repeatQuote(id) {
  const quote = (data.quotes || []).find((item) => item.id === id);
  if (!quote) return;

  editingQuoteId = null;
  renderSelects();
  els.quoteFormTitle.textContent = "Fiyat Teklifini Tekrarla";
  els.quoteSaveBtn.textContent = "Kaydet";
  els.quoteNumber.value = nextQuoteNumber();
  els.quoteCustomer.value = quote.customerId || "";
  els.quoteDate.value = today();
  els.quoteValidUntil.value = addDays(7);
  els.quoteStatus.value = "draft";
  els.quoteNote.value = quote.note || "";
  pendingQuoteScreenshot = quote.screenshot || "";
  renderQuoteScreenshotPreview();
  els.quoteLines.innerHTML = (quote.lines?.length ? quote.lines : []).map((line, index) => createQuoteLineFromData(line, index === 0)).join("");
  if (!els.quoteLines.innerHTML) resetQuoteLines();
  updateQuoteTotals();
  els.quoteFormDialog.showModal();
}

function editInvoice(id) {
  const invoice = data.invoices.find((item) => item.id === id);
  if (!invoice) return;

  editingInvoiceId = id;
  renderSelects();
  els.invoiceFormTitle.textContent = "Satış Faturasını Düzenle";
  els.invoiceSaveBtn.textContent = "Güncelle";
  els.invoiceType.value = invoice.type || "Satış Faturası";
  els.invoiceNumber.value = invoice.number || "";
  els.invoiceCustomer.value = invoice.customerId || "";
  els.invoiceDate.value = invoice.date || today();
  els.invoiceDue.value = invoice.due || addDays(14);
  els.invoiceStatus.value = invoice.status || (invoice.paid ? "paid" : "pending");
  els.invoiceNote.value = invoice.note || "";
  const lines = invoice.lines?.length ? invoice.lines : [invoice];
  els.invoiceLines.innerHTML = lines.map((line, index) => createInvoiceLineFromData(line, index === 0)).join("");
  updateInvoiceTotals();
  els.invoiceFormDialog.showModal();
}

function editExpense(id) {
  const expense = data.expenses.find((item) => item.id === id);
  if (!expense) return;

  editingExpenseId = id;
  renderSelects();
  els.expenseFormTitle.textContent = "Alış Faturasını Düzenle";
  els.expenseSaveBtn.textContent = "Güncelle";
  els.expenseTitle.value = expense.title || "";
  els.expenseDate.value = expense.date || today();
  els.expenseCategory.value = expense.category || "";
  els.expenseStatus.value = expense.status || "pending";
  els.expenseNote.value = expense.note || "";
  const lines = expense.lines?.length ? expense.lines : [];
  els.expenseLines.innerHTML = lines.length
    ? lines.map((line, index) => createExpenseLineFromData(line, index === 0)).join("")
    : createExpenseLineHtml(true);
  updateExpenseTotals();
  els.expenseFormDialog.showModal();
}

function createCustomer(event) {
  event.preventDefault();
  const wasQuickAdd = !!pendingCustomerTarget;
  const quickAddTarget = pendingCustomerTarget;
  const customerData = {
    id: crypto.randomUUID(),
    code: els.customerCode.value.trim(),
    kind: els.customerKind.value,
    name: els.customerName.value.trim(),
    email: els.customerEmail.value.trim(),
    countryCode: els.customerCountryCode.value,
    phone: els.customerPhone.value.trim(),
    address: els.customerAddress.value.trim(),
    tax: els.customerTax.value.trim(),
    taxOffice: els.customerTaxOffice.value.trim(),
    createdAt: new Date().toISOString(),
  };
  if (editingCustomerId) {
    const customer = data.customers.find((item) => item.id === editingCustomerId);
    if (customer) {
      const previousName = customer.name;
      Object.assign(customer, customerData, { id: editingCustomerId, createdAt: customer.createdAt || customerData.createdAt });
      data.expenses.forEach((expense) => {
        if (expense.category === previousName) expense.category = customer.name;
      });
    }
  } else {
    data.customers.push(customerData);
  }
  saveData();
  resetCustomerForm();
  closeFormDialog(els.customerFormDialog);
  renderAll();
  if (wasQuickAdd && !editingCustomerId) {
    selectCreatedCustomer(customerData, quickAddTarget);
  }
}

function editCustomer(id) {
  const customer = data.customers.find((item) => item.id === id);
  if (!customer) return;
  editingCustomerId = id;
  els.customerFormTitle.textContent = "Cari Hesabı Düzenle";
  els.customerSaveBtn.textContent = "Güncelle";
  els.customerCode.value = customer.code || "";
  els.customerKind.value = customer.kind || "customer";
  els.customerName.value = customer.name || "";
  els.customerEmail.value = customer.email || "";
  els.customerCountryCode.value = customer.countryCode || "+90";
  els.customerPhone.value = customer.phone || "";
  els.customerAddress.value = customer.address || "";
  els.customerTax.value = customer.tax || "";
  els.customerTaxOffice.value = customer.taxOffice || "";
  els.customerFormDialog.showModal();
}

function resetCustomerForm() {
  editingCustomerId = null;
  els.customerForm.reset();
  els.customerKind.value = "customer";
  els.customerCountryCode.value = "+90";
  els.customerCode.value = nextCustomerCode("customer");
  els.customerFormTitle.textContent = "Cari Hesap Ekle";
  els.customerSaveBtn.textContent = "Cari Hesabı Kaydet";
}

function openCustomerQuickAdd(target, kind) {
  pendingCustomerTarget = target;
  resetCustomerForm();
  els.customerKind.value = kind;
  els.customerCode.value = nextCustomerCode(kind);
  els.customerFormTitle.textContent = kind === "supplier" ? "Tedarikçi Ekle" : "Müşteri Ekle";
  els.customerSaveBtn.textContent = "Cari Hesabı Kaydet";
  els.customerFormDialog.showModal();
}

function selectCreatedCustomer(customer, target = pendingCustomerTarget) {
  if (!customer || !target) return;
  renderSelects();
  if (target === "invoice") {
    els.invoiceCustomer.value = customer.id;
  }
  if (target === "quote") {
    els.quoteCustomer.value = customer.id;
  }
  if (target === "expense") {
    els.expenseCategory.value = customer.name;
  }
  pendingCustomerTarget = "";
}

function createProduct(event) {
  event.preventDefault();
  const cost = parseNumber(els.productCost.value);
  const margin = parseNumber(els.productMargin.value);
  const productData = {
    id: crypto.randomUUID(),
    code: els.productCode.value.trim(),
    name: els.productName.value.trim(),
    cost,
    margin,
    price: calculateSalePrice(cost, margin),
    unit: els.productUnit.value,
    stock: Number(els.productStock.value),
    createdAt: new Date().toISOString(),
  };

  if (editingProductId) {
    const product = getProduct(editingProductId);
    Object.assign(product, productData, { id: editingProductId, createdAt: product.createdAt || productData.createdAt });
  } else {
    data.products.push(productData);
  }

  saveData();
  els.productForm.reset();
  els.productUnit.value = "Adet";
  els.productCode.value = nextProductCode();
  editingProductId = null;
  closeFormDialog(els.productFormDialog);
  renderAll();
}

function editProduct(id) {
  const product = getProduct(id);
  if (!product) return;

  editingProductId = id;
  els.productFormTitle.textContent = "Stok Kartını Düzenle";
  els.productSaveBtn.textContent = "Güncelle";
  els.productCode.value = product.code || "";
  els.productName.value = product.name || "";
  els.productCost.value = numberText(product.cost ?? product.price ?? 0);
  els.productMargin.value = product.margin || 0;
  els.productPrice.value = numberText(product.price || calculateSalePrice(parseNumber(els.productCost.value), parseNumber(els.productMargin.value)));
  els.productUnit.value = product.unit || "Adet";
  els.productStock.value = product.stock || 0;
  els.productFormDialog.showModal();
}

function calculateSalePrice(cost, margin) {
  return Number((cost * (1 + margin / 100)).toFixed(2));
}

function updateProductSalePrice() {
  const cost = parseNumber(els.productCost.value);
  const margin = parseNumber(els.productMargin.value);
  els.productPrice.value = numberText(calculateSalePrice(cost, margin));
}

function toggleBulkProductEdit() {
  if (!bulkProductEditMode) {
    bulkProductEditMode = true;
    renderProducts();
    return;
  }

  saveBulkProductEdits();
}

function saveBulkProductEdits() {
  document.querySelectorAll("[data-product-row]").forEach((row) => {
    const product = getProduct(row.dataset.productRow);
    if (!product) return;

    const cost = parseNumber(row.querySelector('[data-field="cost"]').value);
    const margin = parseNumber(row.querySelector('[data-field="margin"]').value);
    product.code = row.querySelector('[data-field="code"]').value.trim();
    product.name = row.querySelector('[data-field="name"]').value.trim();
    product.cost = cost;
    product.margin = margin;
    product.price = calculateSalePrice(cost, margin);
    product.unit = row.querySelector('[data-field="unit"]').value;
    product.stock = Number(row.querySelector('[data-field="stock"]').value) || 0;
  });

  bulkProductEditMode = false;
  saveData();
  renderAll();
}

function deleteAllProducts() {
  if (!data.products.length) return;
  const approved = confirm("Tüm stok kartları silinsin mi? Bu işlem geri alınamaz.");
  if (!approved) return;

  data.products = [];
  bulkProductEditMode = false;
  saveData();
  renderAll();
}

function updateBulkProductRowPrice(event) {
  const row = event.target.closest("[data-product-row]");
  if (!row || !["cost", "margin"].includes(event.target.dataset.field)) return;

  const cost = parseNumber(row.querySelector('[data-field="cost"]').value);
  const margin = parseNumber(row.querySelector('[data-field="margin"]').value);
  row.querySelector('[data-field="price"]').value = numberText(calculateSalePrice(cost, margin));
}

function syncInvoiceLineProduct(row, value) {
  const product = findProductByCodeOrName(value);
  if (!product) {
    delete row.dataset.productId;
    return;
  }

  row.dataset.productId = product.id;
  row.querySelector(".invoice-line-code").value = product.code || "";
  row.querySelector(".invoice-line-product").value = product.name || "";
  const unitSelect = row.querySelector(".invoice-line-unit");
  ensureSelectOption(unitSelect, product.unit || "Adet");
  unitSelect.value = product.unit || "Adet";
  row.querySelector(".invoice-line-price").value = numberText(product.price || 0);
}

function syncQuoteLineProduct(row, value) {
  const product = findProductByCodeOrName(value);
  if (!product) {
    delete row.dataset.productId;
    return;
  }

  row.dataset.productId = product.id;
  row.querySelector(".quote-line-code").value = product.code || "";
  row.querySelector(".quote-line-product").value = product.name || "";
  const unitSelect = row.querySelector(".quote-line-unit");
  ensureSelectOption(unitSelect, product.unit || "Adet");
  unitSelect.value = product.unit || "Adet";
  row.querySelector(".quote-line-price").value = numberText(product.price || 0);
}

function syncExpenseLineProduct(row, value) {
  const product = findProductByCodeOrName(value);
  if (!product) {
    delete row.dataset.productId;
    return;
  }

  row.dataset.productId = product.id;
  row.querySelector(".purchase-line-code").value = product.code || "";
  row.querySelector(".purchase-line-product").value = product.name || "";
  const unitSelect = row.querySelector(".purchase-line-unit");
  ensureSelectOption(unitSelect, product.unit || "Adet");
  unitSelect.value = product.unit || "Adet";
  row.querySelector(".purchase-line-price").value = numberText(product.cost || product.price || 0);
}

function ensureSelectOption(select, value) {
  if ([...select.options].some((option) => option.value === value || option.textContent === value)) return;
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  select.append(option);
}

function importProductsCsv(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCsv(decodeText(reader.result));
    if (rows.length < 2) {
      alert("CSV dosyasında ürün satırı bulunamadı.");
      event.target.value = "";
      return;
    }

    const headers = rows[0].map(normalizeHeader);
    const codeIndex = findHeader(headers, ["stokkodu", "kod", "code", "stockcode"]);
    const nameIndex = findHeader(headers, ["aciklama", "ad", "urun", "urunhizmet", "malzeme", "malzemeadi", "name", "description"]);
    const costIndex = findHeader(headers, ["alisfiyati", "alis", "maliyet", "cost", "purchaseprice"]);
    const marginIndex = findHeader(headers, ["karmarji", "kar", "marj", "margin"]);
    const priceIndex = findHeader(headers, ["birimfiyat", "satisfiyati", "fiyat", "price", "unitprice", "saleprice"]);
    const unitIndex = findHeader(headers, ["birim", "unit"]);
    const stockIndex = findHeader(headers, ["stok", "stock", "miktar"]);

    if (nameIndex === -1 || (priceIndex === -1 && costIndex === -1)) {
      alert("CSV başlıklarında açıklama ve fiyat bilgisi bulunmalı. Örnek CSV butonundan şablon indirebilirsiniz.");
      event.target.value = "";
      return;
    }

    let codeCounter = data.products.length;
    const imported = rows
      .slice(1)
      .map((row) => {
        codeCounter += 1;
        const cost = costIndex === -1 ? parseNumber(row[priceIndex]) : parseNumber(row[costIndex]);
        const margin = marginIndex === -1 ? 0 : parseNumber(row[marginIndex]);
        const price = priceIndex === -1 ? calculateSalePrice(cost, margin) : parseNumber(row[priceIndex]);
        return {
          id: crypto.randomUUID(),
          code: (row[codeIndex] || "").trim() || `STK-${String(codeCounter).padStart(4, "0")}`,
          name: (row[nameIndex] || "").trim(),
          cost,
          margin,
          price,
          unit: (row[unitIndex] || "").trim() || "Adet",
          stock: stockIndex === -1 ? 0 : Math.max(0, Math.round(parseNumber(row[stockIndex]))),
          createdAt: new Date().toISOString(),
        };
      })
      .filter((product) => product.name && product.price >= 0);

    if (!imported.length) {
      alert("İçe aktarılacak geçerli ürün bulunamadı.");
      event.target.value = "";
      return;
    }

    data.products.push(...imported);
    saveData();
    renderAll();
    alert(`${imported.length} ürün eklendi.`);
    event.target.value = "";
  };
  reader.readAsArrayBuffer(file);
}

function importInvoiceCsv(event, kind) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCsv(decodeText(reader.result));
    if (rows.length < 2) {
      alert("CSV dosyasında fatura satırı bulunamadı.");
      event.target.value = "";
      return;
    }

    const headers = rows[0].map(normalizeHeader);
    const invoiceNoIndex = findHeader(headers, ["faturano", "fisno", "no", "invoice", "invoiceno"]);
    const customerCodeIndex = findHeader(headers, ["carikodu", "musterikodu", "tedarikcikodu", "hesapkodu", "code"]);
    const customerNameIndex = findHeader(headers, ["cariadi", "musteri", "tedarikci", "unvan", "cari", "name"]);
    const dateIndex = findHeader(headers, ["tarih", "faturatarihi", "date"]);
    const dueIndex = findHeader(headers, ["vade", "vadetarihi", "duedate", "due"]);
    const stockCodeIndex = findHeader(headers, ["stokkodu", "urunkodu", "malzemekodu", "kod", "stockcode"]);
    const productNameIndex = findHeader(headers, ["aciklama", "urun", "urunhizmet", "malzeme", "description", "product"]);
    const quantityIndex = findHeader(headers, ["miktar", "adet", "quantity", "qty"]);
    const unitIndex = findHeader(headers, ["birim", "unit"]);
    const priceIndex = findHeader(headers, ["birimfiyat", "fiyat", "price", "unitprice"]);
    const vatIndex = findHeader(headers, ["kdv", "kdvorani", "vat"]);
    const statusIndex = findHeader(headers, ["durum", "status"]);

    if (customerNameIndex === -1 || productNameIndex === -1 || priceIndex === -1) {
      alert("CSV başlıklarında cari adı, açıklama ve birim fiyat bulunmalı. Örnek CSV butonundan şablon indirebilirsiniz.");
      event.target.value = "";
      return;
    }

    const grouped = new Map();
    rows.slice(1).forEach((row, index) => {
      const invoiceNo = (row[invoiceNoIndex] || "").trim() || `${kind === "sale" ? "SAT" : "ALIŞ"}-CSV-${String(index + 1).padStart(4, "0")}`;
      const groupKey = `${invoiceNo}__${(row[customerNameIndex] || "").trim()}`;
      const rowData = {
        invoiceNo,
        customerCode: customerCodeIndex === -1 ? "" : (row[customerCodeIndex] || "").trim(),
        customerName: (row[customerNameIndex] || "").trim(),
        date: normalizeCsvDate(dateIndex === -1 ? "" : row[dateIndex]) || today(),
        due: normalizeCsvDate(dueIndex === -1 ? "" : row[dueIndex]) || addDays(14),
        status: normalizeInvoiceStatus(statusIndex === -1 ? "" : row[statusIndex]),
      };
      const line = {
        productId: "",
        productCode: stockCodeIndex === -1 ? "" : (row[stockCodeIndex] || "").trim(),
        productName: (row[productNameIndex] || "").trim(),
        quantity: quantityIndex === -1 ? 1 : parseNumber(row[quantityIndex]) || 1,
        unit: unitIndex === -1 ? "Adet" : (row[unitIndex] || "").trim() || "Adet",
        unitPrice: parseNumber(row[priceIndex]),
        vatRate: vatIndex === -1 ? 20 : parseRate(row[vatIndex]),
      };
      line.subtotal = line.quantity * line.unitPrice;
      line.vatAmount = line.subtotal * (line.vatRate / 100);

      if (!line.productName || line.unitPrice < 0) return;
      if (!grouped.has(groupKey)) grouped.set(groupKey, { ...rowData, lines: [] });
      grouped.get(groupKey).lines.push(line);
    });

    const imported = [];
    grouped.forEach((group) => {
      const customer = findOrCreateCustomerForInvoice(group, kind === "sale" ? "customer" : "supplier");
      const lines = ensureInvoiceLineProducts(group.lines, kind === "sale" ? "sale" : "purchase");
      if (!lines.length) return;

      if (kind === "sale") {
        const invoice = buildInvoiceRecord(group, customer, lines);
        data.invoices.push(invoice);
        adjustStockForLines(lines, "sale", "apply");
        imported.push(invoice);
      } else {
        const expense = buildExpenseRecord(group, customer, lines);
        data.expenses.push(expense);
        adjustStockForLines(lines, "purchase", "apply");
        imported.push(expense);
      }
    });

    if (!imported.length) {
      alert("İçe aktarılacak geçerli fatura bulunamadı.");
      event.target.value = "";
      return;
    }

    saveData();
    renderAll();
    alert(`${imported.length} ${kind === "sale" ? "satış" : "alış"} faturası eklendi.`);
    event.target.value = "";
  };
  reader.readAsArrayBuffer(file);
}

function buildInvoiceRecord(group, customer, lines) {
  return {
    id: crypto.randomUUID(),
    number: group.invoiceNo || nextInvoiceNumber(),
    type: "Satış Faturası",
    customerId: customer.id,
    productId: lines[0].productId,
    productName: lines[0].productName,
    quantity: lines[0].quantity,
    unitPrice: lines[0].unitPrice,
    vatRate: lines[0].vatRate,
    vatAmount: lines.reduce((sum, line) => sum + line.vatAmount, 0),
    subtotal: lines.reduce((sum, line) => sum + line.subtotal, 0),
    lines,
    date: group.date,
    due: group.due,
    status: group.status,
    paid: group.status === "paid",
  };
}

function buildExpenseRecord(group, customer, lines) {
  return {
    id: crypto.randomUUID(),
    title: group.invoiceNo,
    date: group.date,
    category: customer.name,
    amount: lines.reduce((sum, line) => sum + line.subtotal + line.vatAmount, 0),
    status: group.status,
    lines,
    type: "purchaseInvoice",
  };
}

function normalizeInvoiceStatus(value) {
  const normalized = normalizeHeader(value);
  if (["odendi", "paid", "tahsil", "kapali"].includes(normalized)) return "paid";
  if (["iptal", "cancelled", "canceled"].includes(normalized)) return "cancelled";
  return "pending";
}

function normalizeCsvDate(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!match) return "";
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseCsv(text) {
  const delimiter = detectCsvDelimiter(text);
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function detectCsvDelimiter(text) {
  const firstLine = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .find((line) => line.trim()) || "";
  const candidates = [";", "\t", ","];
  return candidates
    .map((delimiter) => ({
      delimiter,
      count: countDelimiter(firstLine, delimiter),
    }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function countDelimiter(line, delimiter) {
  let count = 0;
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      count += 1;
    }
  }

  return count;
}

function normalizeHeader(value) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("ı", "i")
    .replace(/[^a-z0-9]/g, "");
}

function findHeader(headers, candidates) {
  return headers.findIndex((header) => candidates.includes(header));
}

function parseNumber(value) {
  const cleaned = String(value || "")
    .trim()
    .replace(/[₺\s]/g, "");

  if (!cleaned) return 0;

  if (cleaned.includes(",")) {
    return Number(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
  }

  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    return Number(cleaned.replace(/\./g, "")) || 0;
  }

  return Number(cleaned) || 0;
}

function parseRate(value) {
  return parseNumber(String(value || "").replace("%", ""));
}

function downloadProductCsvSample() {
  const sample = [
    ["Stok Kodu", "Açıklama", "Alış Fiyatı", "Kar Marjı", "Birim Fiyat", "Birim", "Stok"],
    ["STK-0001", "A4 Fotokopi Kağıdı", "150", "20", "180", "Kutu", "25"],
    ["STK-0002", "Klavye", "625", "20", "750", "Adet", "10"],
  ];
  const csv = sample.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")).join("\n");
  downloadFile("urunler-ornek.csv", csv, "text/csv;charset=utf-8");
}

function downloadInvoiceCsvSample(kind) {
  const isSale = kind === "sale";
  const sample = [
    ["Fatura No", "Cari Kodu", isSale ? "Müşteri" : "Tedarikçi", "Tarih", "Vade", "Stok Kodu", "Açıklama", "Miktar", "Birim", "Birim Fiyat", "KDV", "Durum"],
    [isSale ? "SF-0001" : "AF-0001", isSale ? "120.01.0001" : "320.01.0001", isSale ? "Akdeniz Teknoloji A.Ş." : "Mavi Ofis Ltd.", "20.05.2026", "03.06.2026", "STK-0001", "A4 Fotokopi Kağıdı", "2,5", "Kutu", "184,03", "20", "Bekliyor"],
    [isSale ? "SF-0001" : "AF-0001", isSale ? "120.01.0001" : "320.01.0001", isSale ? "Akdeniz Teknoloji A.Ş." : "Mavi Ofis Ltd.", "20.05.2026", "03.06.2026", "STK-0002", "Klavye", "1", "Adet", "750", "20", "Bekliyor"],
  ];
  const csv = sample.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")).join("\n");
  downloadFile(isSale ? "satis-faturalari-ornek.csv" : "alis-faturalari-ornek.csv", csv, "text/csv;charset=utf-8");
}

function importDebtsCsv(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCsv(decodeText(reader.result));
    if (rows.length < 2) {
      alert("CSV dosyasında borçlu cari satırı bulunamadı.");
      event.target.value = "";
      return;
    }

    const headers = rows[0].map(normalizeHeader);
    const nameIndex = findHeader(headers, ["cariadi", "unvan", "cari", "musteri", "tedarikci", "name"]);
    const contactIndex = findHeader(headers, ["ilgilikisi", "ilgili", "yetkili", "contact", "relatedperson"]);
    const phoneIndex = findHeader(headers, ["telefon", "tel", "gsm", "phone"]);
    const countryCodeIndex = findHeader(headers, ["ulkekodu", "telefonkodu", "countrycode"]);
    const amountIndex = findHeader(headers, ["borc", "borctutari", "tutar", "bakiye", "amount", "debt"]);
    const noteIndex = findHeader(headers, ["aciklama", "not", "note", "description"]);
    const statusIndex = findHeader(headers, ["durum", "status"]);

    if (nameIndex === -1 || amountIndex === -1) {
      alert("CSV başlıklarında cari adı ve borç tutarı bulunmalı. Örnek CSV butonundan şablon indirebilirsiniz.");
      event.target.value = "";
      return;
    }

    const imported = rows
      .slice(1)
      .map((row) => ({
        id: crypto.randomUUID(),
        name: (row[nameIndex] || "").trim(),
        contact: (row[contactIndex] || "").trim(),
        countryCode: (row[countryCodeIndex] || "").trim() || "+90",
        phone: (row[phoneIndex] || "").trim(),
        amount: parseNumber(row[amountIndex]),
        note: (row[noteIndex] || "").trim(),
        status: normalizeDebtStatus(row[statusIndex]),
        createdAt: new Date().toISOString(),
      }))
      .filter((debt) => debt.name && debt.amount > 0);

    if (!imported.length) {
      alert("İçe aktarılacak geçerli borçlu cari bulunamadı.");
      event.target.value = "";
      return;
    }

    data.debts = data.debts || [];
    data.debts.push(...imported);
    saveData();
    renderAll();
    alert(`${imported.length} borçlu cari eklendi.`);
    event.target.value = "";
  };
  reader.readAsArrayBuffer(file);
}

function normalizeDebtStatus(value) {
  const normalized = normalizeHeader(value || "");
  if (["odendi", "paid", "kapandi"].includes(normalized)) return "paid";
  return "pending";
}

function normalizeDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parts = raw.split(/[./-]/).map((part) => part.trim());
  if (parts.length !== 3) return raw;

  const [first, second, third] = parts;
  if (first.length === 4) return `${first}-${second.padStart(2, "0")}-${third.padStart(2, "0")}`;
  return `${third.padStart(4, "20")}-${second.padStart(2, "0")}-${first.padStart(2, "0")}`;
}

function downloadDebtCsvSample() {
  const sample = [
    ["Cari Adı", "İlgili Kişi", "Ülke Kodu", "Telefon", "Borç Tutarı", "Açıklama", "Durum"],
    ["Akdeniz Teknoloji A.Ş.", "Ahmet Yılmaz", "+90", "532 000 00 00", "12500,50", "Mayıs bakiyesi", "Bekliyor"],
    ["Mavi Ofis Ltd.", "Ayşe Demir", "+90", "533 000 00 00", "7400", "Açık hesap", "Bekliyor"],
  ];
  const csv = sample.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")).join("\n");
  downloadFile("borclu-cariler-ornek.csv", csv, "text/csv;charset=utf-8");
}

function deleteAllDebts() {
  if (!data.debts?.length) return;
  const approved = confirm("Tüm borç takip kayıtları silinsin mi? Bu işlem geri alınamaz.");
  if (!approved) return;

  data.debts = [];
  selectedDebtIds.clear();
  saveData();
  renderAll();
}

function toggleVisibleDebtsSelection() {
  const visible = getVisibleDebts();
  const shouldSelect = !visible.every((debt) => selectedDebtIds.has(debt.id));
  visible.forEach((debt) => {
    if (shouldSelect) selectedDebtIds.add(debt.id);
    else selectedDebtIds.delete(debt.id);
  });
  renderDebts();
}

function updateDebtSelection(event) {
  const id = event.target.dataset.debtSelect;
  if (!id) return;
  if (event.target.checked) selectedDebtIds.add(id);
  else selectedDebtIds.delete(id);
  renderDebts();
}

function createDebt(event) {
  event.preventDefault();
  data.debts = data.debts || [];
  const record = {
    id: editingDebtId || crypto.randomUUID(),
    name: els.debtName.value.trim(),
    contact: els.debtContact.value.trim(),
    countryCode: els.debtCountryCode.value,
    phone: els.debtPhone.value.trim(),
    amount: parseNumber(els.debtAmount.value),
    note: els.debtNote.value.trim(),
    status: els.debtStatus.value,
    createdAt: data.debts.find((item) => item.id === editingDebtId)?.createdAt || new Date().toISOString(),
  };
  if (editingDebtId) {
    data.debts = data.debts.map((debt) => (debt.id === editingDebtId ? record : debt));
  } else {
    data.debts.push(record);
  }
  saveData();
  closeFormDialog(els.debtFormDialog);
  renderAll();
}

function editDebt(id) {
  const debt = (data.debts || []).find((item) => item.id === id);
  if (!debt) return;

  editingDebtId = id;
  els.debtFormTitle.textContent = "Borçlu Cariyi Düzenle";
  els.debtSaveBtn.textContent = "Güncelle";
  els.debtContact.value = debt.contact || debt.relatedPerson || "";
  els.debtName.value = debt.name || "";
  els.debtCountryCode.value = debt.countryCode || "+90";
  els.debtPhone.value = debt.phone || "";
  els.debtAmount.value = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(debt.amount) || 0);
  els.debtNote.value = debt.note || "";
  els.debtStatus.value = debt.status || "pending";
  els.debtFormDialog.showModal();
  els.debtName.focus();
}

function resetDebtForm() {
  editingDebtId = null;
  els.debtForm.reset();
  els.debtCountryCode.value = "+90";
  els.debtStatus.value = "pending";
  els.debtFormTitle.textContent = "Borçlu Cari Ekle";
  els.debtSaveBtn.textContent = "Borç Kaydet";
}

function toggleDebtPaid(id) {
  const debt = (data.debts || []).find((item) => item.id === id);
  if (!debt) return;

  debt.status = debt.status === "paid" ? "pending" : "paid";
  saveData();
  renderAll();
}

function createTracking(event) {
  event.preventDefault();
  if (!els.trackingCustomer.value) return;
  data.tracking = data.tracking || [];
  const record = {
    id: editingTrackingId || crypto.randomUUID(),
    customerId: els.trackingCustomer.value,
    date: els.trackingDate.value || today(),
    nextDate: els.trackingNextDate.value,
    status: els.trackingStatus.value,
    note: els.trackingNote.value.trim(),
    quoteNotes: trackingQuoteNotes(),
    createdAt: editingTrackingId
      ? data.tracking.find((item) => item.id === editingTrackingId)?.createdAt || new Date().toISOString()
      : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (editingTrackingId) {
    data.tracking = data.tracking.map((item) => (item.id === editingTrackingId ? record : item));
  } else {
    data.tracking.unshift(record);
  }

  saveData();
  resetTrackingForm();
  els.trackingFormDialog.close();
  renderAll();
}

function createReceipt(event) {
  event.preventDefault();
  data.receipts = data.receipts || [];
  const amount = parseNumber(els.receiptAmount.value);
  if (!els.receiptCustomer.value || amount <= 0) return;
  const currentReceipt = editingReceiptId ? data.receipts.find((item) => item.id === editingReceiptId) : null;
  const previousInvoiceId = currentReceipt?.invoiceId;

  const receipt = {
    id: crypto.randomUUID(),
    customerId: els.receiptCustomer.value,
    invoiceId: els.receiptInvoice.value,
    date: els.receiptDate.value || today(),
    amount,
    method: els.receiptMethod.value,
    note: els.receiptNote.value.trim(),
  };

  if (currentReceipt) {
    Object.assign(currentReceipt, receipt, { id: editingReceiptId });
  } else {
    data.receipts.push(receipt);
  }
  updateInvoicePaymentStatus(previousInvoiceId);
  updateInvoicePaymentStatus(receipt.invoiceId);
  saveData();
  resetReceiptForm();
  els.receiptFormDialog.close();
  renderAll();
}

function updateInvoicePaymentStatus(invoiceId) {
  if (!invoiceId) return;
  const invoice = data.invoices.find((item) => item.id === invoiceId);
  if (!invoice) return;

  const collected = getInvoiceReceiptTotal(invoiceId);
  if (collected >= totalInvoice(invoice)) {
    invoice.paid = true;
    invoice.status = "paid";
  } else if (invoice.status === "paid") {
    invoice.paid = false;
    invoice.status = "pending";
  }
}

function deleteReceipt(id) {
  const receipt = (data.receipts || []).find((item) => item.id === id);
  data.receipts = (data.receipts || []).filter((item) => item.id !== id);
  updateInvoicePaymentStatus(receipt?.invoiceId);
  if (editingReceiptId === id) resetReceiptForm();
  saveData();
  renderAll();
}

function editReceipt(id) {
  const receipt = (data.receipts || []).find((item) => item.id === id);
  if (!receipt) return;
  editingReceiptId = id;
  els.receiptFormTitle.textContent = "Tahsilatı Düzenle";
  els.receiptSaveBtn.textContent = "Güncelle";
  els.receiptCustomer.value = receipt.customerId;
  renderReceiptInvoiceOptions();
  els.receiptInvoice.value = receipt.invoiceId || "";
  els.receiptDate.value = receipt.date || today();
  els.receiptAmount.value = numberText(receipt.amount);
  els.receiptMethod.value = receipt.method || "Banka";
  els.receiptNote.value = receipt.note || "";
  els.receiptFormDialog.showModal();
  els.receiptAmount.focus();
}

function resetReceiptForm() {
  editingReceiptId = null;
  els.receiptForm.reset();
  els.receiptDate.value = today();
  els.receiptMethod.value = "Banka";
  els.receiptFormTitle.textContent = "Tahsilat Yap";
  els.receiptSaveBtn.textContent = "Tahsilatı Kaydet";
  renderReceiptInvoiceOptions();
}

function createBankAccount(event) {
  event.preventDefault();
  data.bankAccounts = data.bankAccounts || [];
  const bankData = {
    id: crypto.randomUUID(),
    bankName: els.bankName.value.trim(),
    accountName: els.bankAccountName.value.trim(),
    iban: formatIban(els.bankIban.value),
    branch: els.bankBranch.value.trim(),
    currency: els.bankCurrency.value,
    note: els.bankNote.value.trim(),
  };

  if (editingBankId) {
    const account = data.bankAccounts.find((item) => item.id === editingBankId);
    if (account) Object.assign(account, bankData, { id: editingBankId });
  } else {
    data.bankAccounts.push(bankData);
  }

  saveData();
  resetBankForm();
  renderAll();
}

async function createUserAccount(event) {
  event.preventDefault();
  data.users = data.users || [];
  const username = els.userUsername.value.trim();
  const exists = data.users.some((user) => {
    return user.id !== editingUserId && normalizeSearch(user.username) === normalizeSearch(username);
  });

  if (exists) {
    alert("Bu kullanıcı adı zaten kayıtlı.");
    return;
  }
  if (!editingUserId && !els.userPassword.value) {
    alert("Yeni kullanıcı için şifre girin.");
    return;
  }

  const userData = {
    id: crypto.randomUUID(),
    username,
    fullName: els.userFullName.value.trim(),
    email: els.userEmail.value.trim(),
    role: els.userRole.value,
    status: els.userStatus.value,
    password: "",
    passwordHash: els.userPassword.value ? await hashPassword(els.userPassword.value) : "",
  };

  if (editingUserId) {
    const user = data.users.find((item) => item.id === editingUserId);
    if (user) {
      Object.assign(user, userData, {
        id: editingUserId,
        password: "",
        passwordHash: els.userPassword.value ? userData.passwordHash : user.passwordHash || "",
      });
    }
  } else {
    data.users.push(userData);
  }

  saveData();
  resetUserForm();
  renderAll();
}

function editBankAccount(id) {
  const account = (data.bankAccounts || []).find((item) => item.id === id);
  if (!account) return;

  editingBankId = id;
  els.bankFormTitle.textContent = "Banka Hesabını Düzenle";
  els.bankSaveBtn.textContent = "Güncelle";
  els.bankName.value = account.bankName || "";
  els.bankAccountName.value = account.accountName || "";
  els.bankIban.value = account.iban || "";
  els.bankBranch.value = account.branch || "";
  els.bankCurrency.value = account.currency || "TRY";
  els.bankNote.value = account.note || "";
  els.bankName.focus();
}

function editUserAccount(id) {
  const user = (data.users || []).find((item) => item.id === id);
  if (!user) return;

  editingUserId = id;
  els.userFormTitle.textContent = "Kullanıcıyı Düzenle";
  els.userSaveBtn.textContent = "Güncelle";
  els.userUsername.value = user.username || "";
  els.userFullName.value = user.fullName || "";
  els.userEmail.value = user.email || "";
  els.userRole.value = user.role || "Yönetici";
  els.userStatus.value = user.status || "Aktif";
  els.userPassword.value = "";
  els.userUsername.focus();
}

function resetBankForm() {
  editingBankId = null;
  els.bankForm.reset();
  els.bankCurrency.value = "TRY";
  els.bankFormTitle.textContent = "Banka Hesabı Ekle";
  els.bankSaveBtn.textContent = "Banka Hesabını Kaydet";
}

function resetUserForm() {
  editingUserId = null;
  els.userForm.reset();
  els.userRole.value = "Yönetici";
  els.userStatus.value = "Aktif";
  els.userFormTitle.textContent = "Kullanıcı Hesabı Ekle";
  els.userSaveBtn.textContent = "Kullanıcıyı Kaydet";
}

function saveCompanyLogo(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Lütfen geçerli bir logo görseli seçin.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    data.company = data.company || {};
    data.company.logo = reader.result;
    saveData();
    renderCompanyLogo();
    event.target.value = "";
  };
  reader.readAsDataURL(file);
}

function removeCompanyLogo() {
  data.company = data.company || {};
  data.company.logo = "";
  saveData();
  renderCompanyLogo();
}

function saveCompanyInfo(event) {
  event.preventDefault();
  data.company = data.company || {};
  Object.assign(data.company, {
    name: els.companyName.value.trim(),
    phone: els.companyPhone.value.trim(),
    email: els.companyEmail.value.trim(),
    website: els.companyWebsite.value.trim(),
    address: els.companyAddress.value.trim(),
    tax: els.companyTax.value.trim(),
    taxOffice: els.companyTaxOffice.value.trim(),
  });
  saveData();
  renderCompanyLogo();
}

function formatIban(value) {
  return String(value || "")
    .replace(/\s/g, "")
    .toLocaleUpperCase("tr-TR")
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatDebtAmountInput() {
  const value = parseNumber(els.debtAmount.value);
  if (!value) {
    els.debtAmount.value = "";
    return;
  }
  els.debtAmount.value = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoneyInput(input) {
  const value = parseNumber(input.value);
  if (!value) {
    input.value = "";
    return;
  }
  input.value = numberText(value);
}

function documentBrand(subtitle) {
  const logo = data.company?.logo;
  const companyName = data.company?.name || "Muhasebe Pro";
  const companyInfo = companyDocumentInfo();
  if (logo) {
    return `
      <div class="document-brand">
        <img src="${logo}" alt="Firma logosu" />
        <p class="muted">${subtitle}</p>
        ${companyInfo}
      </div>
    `;
  }
  return `
    <div>
      <h2>${companyName}</h2>
      <p class="muted">${subtitle}</p>
      ${companyInfo}
    </div>
  `;
}

function companyDocumentInfo() {
  const company = data.company || {};
  const rows = [
    company.address,
    company.phone,
    company.email,
    company.website,
    company.tax ? `Vergi No: ${company.tax}` : "",
    company.taxOffice ? `Vergi Dairesi: ${company.taxOffice}` : "",
  ].filter(Boolean);
  return rows.length ? `<p class="muted company-document-info">${rows.join("<br />")}</p>` : "";
}

function customerInvoiceInfo(customer) {
  if (!customer) return "";
  const rows = [
    customer.email,
    customer.phone,
    customer.address,
    customer.tax ? `Vergi No: ${customer.tax}` : "",
  ].filter(Boolean);
  return rows.length ? `<p class="muted">${rows.join("<br />")}</p>` : "";
}

function documentNote(note) {
  return note ? `<p><strong>Açıklama:</strong> ${note}</p>` : "";
}

function handleMoneyInputBlur(event) {
  if (
    event.target.matches(
      ".invoice-line-price, .quote-line-price, .purchase-line-price, .money-input, #productCost, #productPrice, #receiptAmount",
    )
  ) {
    formatMoneyInput(event.target);
  }
}

function decodeText(buffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1254").decode(buffer);
  }
}

function previewInvoice(id) {
  const invoice = data.invoices.find((item) => item.id === id);
  const customer = getCustomer(invoice.customerId);
  const lines = Array.isArray(invoice.lines)
    ? invoice.lines
    : [
        {
          productName: invoice.productName,
          quantity: invoice.quantity,
          unit: invoice.unit || "Adet",
          unitPrice: invoice.unitPrice,
          vatAmount: invoice.vatAmount,
          subtotal: invoice.subtotal,
        },
      ];

  els.invoicePreview.innerHTML = `
    <article class="invoice-paper">
      <header>
        ${documentBrand(isReturnInvoice(invoice) ? "İADE FATURASI" : "SATIŞ FATURASI")}
        <div>
          <strong>${invoice.number}</strong>
          <p class="muted">Tarih: ${shortDate(invoice.date)}<br />Vade: ${shortDate(invoice.due)}</p>
        </div>
      </header>
      <section>
        <strong>${customer?.name || "Cari silinmiş"}</strong>
        ${customerInvoiceInfo(customer)}
      </section>
      <table>
        <thead>
          <tr>
            <th>Ürün / Hizmet</th>
            <th>Miktar</th>
            <th>Birim</th>
            <th>Birim Fiyat</th>
            <th>KDV</th>
            <th>Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${lines
            .map(
              (line) => `
                <tr>
                  <td>${line.productName}</td>
                  <td>${line.quantity}</td>
                  <td>${line.unit || "Adet"}</td>
                  <td>${money(line.unitPrice)}</td>
                  <td>${money(line.vatAmount)}</td>
                  <td>${money(line.subtotal + line.vatAmount)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
      ${documentNote(invoice.note)}
      <p><strong>Ara Toplam:</strong> ${money(invoiceSubtotal(invoice))}</p>
      <p><strong>KDV:</strong> ${money(invoiceVatTotal(invoice))}</p>
      <p><strong>Durum:</strong> ${statusLabel(invoice)}</p>
    </article>
  `;
  els.invoiceDialog.showModal();
}

function previewQuote(id) {
  const quote = (data.quotes || []).find((item) => item.id === id);
  if (!quote) return;
  const customer = getCustomer(quote.customerId);
  const lines = quote.lines || [];

  els.invoicePreview.innerHTML = `
    <article class="invoice-paper">
      <header>
        ${documentBrand("FİYAT TEKLİFİ")}
        <div>
          <strong>${quote.number}</strong>
          <p class="muted">Tarih: ${shortDate(quote.date)}<br />Geçerlilik: ${shortDate(quote.validUntil)}</p>
        </div>
      </header>
      <section>
        <strong>${customer?.name || "Cari silinmiş"}</strong>
        ${customerInvoiceInfo(customer)}
      </section>
      <table>
        <thead>
          <tr>
            <th>Ürün / Hizmet</th>
            <th>Miktar</th>
            <th>Birim</th>
            <th>Birim Fiyat</th>
            <th>KDV</th>
            <th>Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${lines
            .map(
              (line) => `
                <tr>
                  <td>${line.productName}</td>
                  <td>${line.quantity}</td>
                  <td>${line.unit || "Adet"}</td>
                  <td>${money(line.unitPrice)}</td>
                  <td>${money(line.vatAmount)}</td>
                  <td>${money(line.subtotal + line.vatAmount)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
      ${documentNote(quote.note)}
      <p><strong>Ara Toplam:</strong> ${money(quoteSubtotal(quote))}</p>
      <p><strong>KDV:</strong> ${money(quoteVatTotal(quote))}</p>
      <p><strong>Toplam:</strong> ${money(quoteTotal(quote))}</p>
      <p><strong>Durum:</strong> ${quoteStatusLabel(quote)}</p>
    </article>
  `;
  els.invoiceDialog.showModal();
}

function previewExpense(id) {
  const expense = data.expenses.find((item) => item.id === id);
  if (!expense) return;
  const supplier = findCustomerByName(expense.category);
  const lines = expense.lines?.length
    ? expense.lines
    : [{ productName: expense.title, quantity: 1, unit: "Adet", unitPrice: expense.amount, vatAmount: 0, subtotal: expense.amount }];

  els.invoicePreview.innerHTML = `
    <article class="invoice-paper">
      <header>
        ${documentBrand("ALIŞ FATURASI")}
        <div>
          <strong>${expense.title}</strong>
          <p class="muted">Tarih: ${shortDate(expense.date)}</p>
        </div>
      </header>
      <section>
        <strong>${supplier?.name || expense.category || "Tedarikçi"}</strong>
        ${customerInvoiceInfo(supplier)}
      </section>
      <table>
        <thead>
          <tr>
            <th>Ürün / Hizmet</th>
            <th>Miktar</th>
            <th>Birim</th>
            <th>Birim Fiyat</th>
            <th>KDV</th>
            <th>Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${lines
            .map(
              (line) => `
                <tr>
                  <td>${line.productName}</td>
                  <td>${line.quantity}</td>
                  <td>${line.unit || "Adet"}</td>
                  <td>${money(line.unitPrice)}</td>
                  <td>${money(line.vatAmount)}</td>
                  <td>${money(line.subtotal + line.vatAmount)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
      ${documentNote(expense.note)}
      <p><strong>Ara Toplam:</strong> ${money(lines.reduce((sum, line) => sum + line.subtotal, 0))}</p>
      <p><strong>KDV:</strong> ${money(lines.reduce((sum, line) => sum + line.vatAmount, 0))}</p>
      <p><strong>Durum:</strong> ${statusLabel({ status: expense.status, paid: expense.status === "paid" })}</p>
    </article>
  `;
  els.invoiceDialog.showModal();
}

function receiptNumber(receipt) {
  const datePart = String(receipt.date || today()).replaceAll("-", "");
  const idPart = String(receipt.id || "").slice(0, 6).toLocaleUpperCase("tr-TR");
  return `TM-${datePart}-${idPart}`;
}

function previewReceipt(id) {
  const receipt = (data.receipts || []).find((item) => item.id === id);
  if (!receipt) return;
  const customer = getCustomer(receipt.customerId);
  const invoice = data.invoices.find((item) => item.id === receipt.invoiceId);

  els.receiptPreview.innerHTML = `
    <article class="invoice-paper receipt-paper">
      <header>
        ${documentBrand("TAHSİLAT MAKBUZU")}
        <div>
          <strong>${receiptNumber(receipt)}</strong>
          <p class="muted">Tarih: ${shortDate(receipt.date || today())}</p>
        </div>
      </header>
      <section class="receipt-summary">
        <div>
          <span class="muted">Cari Hesap</span>
          <strong>${customer?.name || "Cari silinmiş"}</strong>
        </div>
        <div>
          <span class="muted">Cari Kodu</span>
          <strong>${customer?.code || "-"}</strong>
        </div>
        <div>
          <span class="muted">Fatura</span>
          <strong>${invoice?.number || "Fatura seçilmedi"}</strong>
        </div>
        <div>
          <span class="muted">Ödeme Şekli</span>
          <strong>${receipt.method || "Banka"}</strong>
        </div>
      </section>
      <section>
        <p><strong>Yalnız:</strong> ${money(receipt.amount)} tahsil edilmiştir.</p>
        <p><strong>Açıklama:</strong> ${receipt.note || "-"}</p>
      </section>
      <footer class="receipt-signatures">
        <div>Tahsil Eden</div>
        <div>Ödeyen</div>
      </footer>
    </article>
  `;
  els.receiptDialog.showModal();
}

function printableDocumentHtml(content, title) {
  return `<!doctype html>
    <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          @page {
            size: A4;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #ffffff;
            color: #111827;
            font-family: Manrope, Arial, sans-serif;
            font-size: 10.5px;
            line-height: 1.35;
          }

          .invoice-paper {
            display: grid;
            gap: 12px;
            width: 100%;
          }

          .invoice-paper header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          h2 {
            margin: 0 0 4px;
            font-size: 15px;
          }

          p {
            margin: 6px 0;
          }

          .muted {
            color: #667085;
          }

          .document-brand {
            display: grid;
            gap: 6px;
            align-content: start;
          }

          .document-brand img {
            max-width: 190px;
            max-height: 64px;
            object-fit: contain;
            object-position: left center;
          }

          .company-document-info {
            margin-top: 4px;
            line-height: 1.45;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 9.5px;
          }

          th,
          td {
            padding: 6px 5px;
            border-bottom: 1px solid #d7e0ea;
            text-align: left;
            vertical-align: top;
            overflow-wrap: anywhere;
          }

          th {
            color: #667085;
            font-size: 8.5px;
            text-transform: uppercase;
          }

          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .receipt-summary {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            padding: 12px;
            border: 1px solid #d7e0ea;
            border-radius: 8px;
            background: #fbfdff;
          }

          .receipt-summary div {
            display: grid;
            gap: 3px;
          }

          .receipt-signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-top: 34px;
          }

          .receipt-signatures div {
            min-height: 70px;
            padding-top: 10px;
            border-top: 1px solid #111827;
            color: #667085;
            text-align: center;
            font-weight: 800;
          }
        </style>
      </head>
      <body>${content}</body>
    </html>`;
}

function printPreviewAsPdf(previewElement, title) {
  if (!previewElement?.innerHTML.trim()) return;

  const frame = document.createElement("iframe");
  frame.title = title;
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  frame.style.opacity = "0";
  document.body.appendChild(frame);

  const frameWindow = frame.contentWindow;
  const frameDocument = frameWindow.document;
  frameWindow.onafterprint = () => frame.remove();
  frameDocument.open();
  frameDocument.write(printableDocumentHtml(previewElement.innerHTML, title));
  frameDocument.close();

  frame.onload = () => {
    frameWindow.focus();
    frameWindow.print();
    setTimeout(() => frame.remove(), 3000);
  };
}

function handleTableClicks(event) {
  const target = event.target.closest("button") || event.target;
  const paginationKey = target.dataset.pagination;
  if (paginationKey && Object.hasOwn(tablePages, paginationKey)) {
    tablePages[paginationKey] = Number(target.dataset.page) || 1;
    if (paginationKey === "invoices") renderInvoices();
    if (paginationKey === "quotes") renderQuotes();
    if (paginationKey === "expenses") renderExpenses();
    if (paginationKey === "customers") renderCustomers();
    if (paginationKey === "tracking") renderCustomerTracking();
    if (paginationKey === "products") renderProducts();
    if (paginationKey === "receipts") renderReceipts();
    return;
  }
  const previewId = target.dataset.preview;
  const previewQuoteId = target.dataset.previewQuote;
  const previewExpenseId = target.dataset.previewExpense;
  const toggleId = target.dataset.toggle;
  const editInvoiceId = target.dataset.editInvoice;
  const editQuoteId = target.dataset.editQuote;
  const repeatQuoteId = target.dataset.repeatQuote;
  const editExpenseId = target.dataset.editExpense;
  const editReceiptId = target.dataset.editReceipt;
  const printReceiptId = target.dataset.printReceipt;
  const deleteInvoiceId = target.dataset.deleteInvoice;
  const deleteQuoteId = target.dataset.deleteQuote;
  const deleteExpenseId = target.dataset.deleteExpense;
  const deleteCustomerId = target.dataset.deleteCustomer;
  const editCustomerId = target.dataset.editCustomer;
  const editTrackingId = target.dataset.editTracking;
  const deleteProductId = target.dataset.deleteProduct;
  const deleteTrackingId = target.dataset.deleteTracking;
  const editDebtId = target.dataset.editDebt;
  const toggleDebtPaidId = target.dataset.toggleDebtPaid;
  const deleteDebtId = target.dataset.deleteDebt;
  const deleteReceiptId = target.dataset.deleteReceipt;
  const whatsappDebtId = target.dataset.whatsappDebt;
  const deleteBankId = target.dataset.deleteBank;
  const deleteUserId = target.dataset.deleteUser;
  const editBankId = target.dataset.editBank;
  const editUserId = target.dataset.editUser;
  const editProductId = target.dataset.editProduct;
  const viewImageId = target.dataset.viewImage;

  if (previewId) previewInvoice(previewId);
  if (previewQuoteId) previewQuote(previewQuoteId);
  if (previewExpenseId) previewExpense(previewExpenseId);
  if (editInvoiceId) editInvoice(editInvoiceId);
  if (editQuoteId) editQuote(editQuoteId);
  if (repeatQuoteId) repeatQuote(repeatQuoteId);
  if (editExpenseId) editExpense(editExpenseId);
  if (editCustomerId) editCustomer(editCustomerId);
  if (editTrackingId) editTracking(editTrackingId);
  if (editProductId) editProduct(editProductId);
  if (editReceiptId) editReceipt(editReceiptId);
  if (editDebtId) editDebt(editDebtId);
  if (toggleDebtPaidId) toggleDebtPaid(toggleDebtPaidId);
  if (editBankId) editBankAccount(editBankId);
  if (editUserId) editUserAccount(editUserId);
  if (viewImageId) {
    const quote = (data.quotes || []).find((item) => item.id === viewImageId);
    openImageDialog(quote?.screenshot);
  }
  if (target.closest("[data-view-current-quote-image]")) openImageDialog(pendingQuoteScreenshot);
  if (printReceiptId) previewReceipt(printReceiptId);
  if (whatsappDebtId) openDebtWhatsappReminder(whatsappDebtId);
  if (toggleId) {
    const invoice = data.invoices.find((item) => item.id === toggleId);
    invoice.paid = !invoice.paid;
    invoice.status = invoice.paid ? "paid" : "pending";
    saveData();
    renderAll();
  }
  if (deleteInvoiceId) deleteInvoice(deleteInvoiceId);
  if (deleteQuoteId) {
    if (editingQuoteId === deleteQuoteId) closeFormDialog(els.quoteFormDialog);
    removeItem("quotes", deleteQuoteId);
  }
  if (deleteExpenseId) deleteExpense(deleteExpenseId);
  if (deleteReceiptId) deleteReceipt(deleteReceiptId);
  if (deleteCustomerId) {
    if (editingCustomerId === deleteCustomerId) closeFormDialog(els.customerFormDialog);
    removeItem("customers", deleteCustomerId);
  }
  if (deleteProductId) removeItem("products", deleteProductId);
  if (deleteTrackingId) {
    if (editingTrackingId === deleteTrackingId) resetTrackingForm();
    removeItem("tracking", deleteTrackingId);
  }
  if (deleteDebtId) {
    if (editingDebtId === deleteDebtId) closeFormDialog(els.debtFormDialog);
    selectedDebtIds.delete(deleteDebtId);
    removeItem("debts", deleteDebtId);
  }
  if (deleteBankId) {
    if (editingBankId === deleteBankId) resetBankForm();
    removeItem("bankAccounts", deleteBankId);
  }
  if (deleteUserId) {
    if (editingUserId === deleteUserId) resetUserForm();
    removeItem("users", deleteUserId);
  }
}

function removeItem(collection, id) {
  data[collection] = data[collection].filter((item) => item.id !== id);
  saveData();
  renderAll();
}

function deleteInvoice(id) {
  const invoice = data.invoices.find((item) => item.id === id);
  if (invoice) adjustStockForLines(getStoredLines(invoice), invoiceStockKind(invoice), "reverse");
  if (editingInvoiceId === id) closeFormDialog(els.invoiceFormDialog);
  removeItem("invoices", id);
}

function deleteExpense(id) {
  const expense = data.expenses.find((item) => item.id === id);
  if (expense) adjustStockForLines(getStoredLines(expense), "purchase", "reverse");
  if (editingExpenseId === id) closeFormDialog(els.expenseFormDialog);
  removeItem("expenses", id);
}

function exportJson() {
  downloadFile(`muhasebe-pro-yedek-${today()}.json`, JSON.stringify(data, null, 2), "application/json");
}

function exportCsv() {
  const rows = [
    ["Tür", "No/Açıklama", "Cari/Tedarikçi", "Tarih", "Tutar"],
    ...data.invoices.map((invoice) => [
      "Satış Faturası",
      invoice.number,
      getCustomer(invoice.customerId)?.name || "",
      invoice.date,
      totalInvoice(invoice),
    ]),
    ...(data.quotes || []).map((quote) => [
      "Fiyat Teklifi",
      quote.number,
      getCustomer(quote.customerId)?.name || "",
      quote.date,
      quoteTotal(quote),
    ]),
    ...data.expenses.map((expense) => ["Alış Faturası", expense.title, expense.category, expense.date, expense.amount]),
    ...(data.receipts || []).map((receipt) => [
      "Tahsilat",
      data.invoices.find((invoice) => invoice.id === receipt.invoiceId)?.number || receipt.method || "",
      getCustomer(receipt.customerId)?.name || "",
      receipt.date,
      receipt.amount,
    ]),
    ...(data.debts || []).map((debt) => [
      "Borç Takip",
      debt.note || debt.contact || "",
      debt.name,
      debt.contact || "",
      debt.amount,
    ]),
    ...(data.tracking || []).map((item) => [
      "Müşteri Takip",
      trackingStatusLabel(item.status),
      getCustomer(item.customerId)?.name || "",
      item.nextDate || item.date || "",
      [item.note, ...Object.values(item.quoteNotes || {})].filter(Boolean).join(" | "),
    ]),
    ...(data.bankAccounts || []).map((account) => [
      "Banka Hesabı",
      account.bankName,
      account.accountName,
      account.currency || "TRY",
      account.iban,
    ]),
    ...(data.users || []).map((user) => [
      "Kullanıcı",
      user.username,
      user.fullName,
      user.role || "",
      user.status || "",
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadFile(`muhasebe-pro-rapor-${today()}.csv`, csv, "text/csv;charset=utf-8");
}

function downloadFile(filename, content, type) {
  const shouldAddBom = type.toLocaleLowerCase("tr-TR").includes("text/csv");
  const blob = new Blob([shouldAddBom ? "\uFEFF" : "", content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      data = {
        customers: imported.customers || [],
        products: imported.products || [],
        invoices: imported.invoices || [],
        quotes: imported.quotes || [],
        expenses: imported.expenses || [],
        receipts: imported.receipts || [],
        debts: imported.debts || [],
        tracking: imported.tracking || [],
        bankAccounts: imported.bankAccounts || [],
        widgets: imported.widgets || {},
        messageTemplates: imported.messageTemplates || {},
        company: imported.company || {},
        users: imported.users || [],
      };
      data = normalizeData(data);
      saveData();
      renderAll();
    } catch {
      alert("Dosya okunamadı. Lütfen geçerli bir JSON yedeği seçin.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

els.nav.addEventListener("click", (event) => {
  const button = event.target.closest(".nav-item");
  if (button) switchView(button.dataset.view);
});
els.loginForm.addEventListener("submit", login);
els.logoutBtn.addEventListener("click", logout);
els.invoiceForm.addEventListener("submit", createInvoice);
els.invoiceLines.addEventListener("input", updateInvoiceTotals);
els.invoiceLines.addEventListener("focusout", handleMoneyInputBlur);
els.invoiceLines.addEventListener("change", (event) => {
  if (event.target.classList.contains("invoice-line-product") || event.target.classList.contains("invoice-line-code")) {
    syncInvoiceLineProduct(event.target.closest(".invoice-line"), event.target.value);
  }
  updateInvoiceTotals();
});
els.invoiceLines.addEventListener("click", (event) => {
  if (!event.target.classList.contains("line-remove-button")) return;
  if (els.invoiceLines.querySelectorAll(".invoice-line").length === 1) {
    event.target.closest(".invoice-line").querySelector(".invoice-line-product").value = "";
    event.target.closest(".invoice-line").querySelector(".invoice-line-code").value = "";
    event.target.closest(".invoice-line").querySelector(".invoice-line-qty").value = 1;
    event.target.closest(".invoice-line").querySelector(".invoice-line-unit").value = "Adet";
    event.target.closest(".invoice-line").querySelector(".invoice-line-price").value = 0;
    delete event.target.closest(".invoice-line").dataset.productId;
  } else {
    event.target.closest(".invoice-line").remove();
  }
  updateInvoiceTotals();
});
els.addInvoiceLineBtn.addEventListener("click", () => {
  els.invoiceLines.insertAdjacentHTML("beforeend", createInvoiceLineHtml(false));
  updateInvoiceTotals();
});
els.invoiceGlobalVat.addEventListener("change", () => {
  document.querySelectorAll(".invoice-line-vat").forEach((select) => {
    select.value = els.invoiceGlobalVat.value;
  });
  updateInvoiceTotals();
});
els.quoteForm.addEventListener("submit", createQuote);
els.quoteScreenshotInput.addEventListener("change", saveQuoteScreenshot);
els.removeQuoteScreenshotBtn.addEventListener("click", removeQuoteScreenshot);
els.quoteForm.addEventListener("paste", pasteQuoteScreenshot);
els.quoteLines.addEventListener("input", updateQuoteTotals);
els.quoteLines.addEventListener("focusout", handleMoneyInputBlur);
els.quoteLines.addEventListener("change", (event) => {
  if (event.target.classList.contains("quote-line-product") || event.target.classList.contains("quote-line-code")) {
    syncQuoteLineProduct(event.target.closest(".invoice-line"), event.target.value);
  }
  updateQuoteTotals();
});
els.quoteLines.addEventListener("click", (event) => {
  if (!event.target.classList.contains("line-remove-button")) return;
  const row = event.target.closest(".invoice-line");
  if (els.quoteLines.querySelectorAll(".invoice-line").length === 1) {
    row.querySelector(".quote-line-product").value = "";
    row.querySelector(".quote-line-code").value = "";
    row.querySelector(".quote-line-qty").value = 1;
    row.querySelector(".quote-line-unit").value = "Adet";
    row.querySelector(".quote-line-price").value = 0;
    delete row.dataset.productId;
  } else {
    row.remove();
  }
  updateQuoteTotals();
});
els.addQuoteLineBtn.addEventListener("click", () => {
  els.quoteLines.insertAdjacentHTML("beforeend", createQuoteLineHtml(false));
  updateQuoteTotals();
});
els.expenseForm.addEventListener("submit", createExpense);
els.expenseLines.addEventListener("input", updateExpenseTotals);
els.expenseLines.addEventListener("focusout", handleMoneyInputBlur);
els.expenseLines.addEventListener("change", (event) => {
  if (event.target.classList.contains("purchase-line-product") || event.target.classList.contains("purchase-line-code")) {
    syncExpenseLineProduct(event.target.closest(".invoice-line"), event.target.value);
  }
  updateExpenseTotals();
});
els.expenseLines.addEventListener("click", (event) => {
  if (!event.target.classList.contains("line-remove-button")) return;
  const row = event.target.closest(".invoice-line");
  if (document.querySelectorAll("#expenseLines .invoice-line").length === 1) {
    row.querySelector(".purchase-line-product").value = "";
    row.querySelector(".purchase-line-code").value = "";
    row.querySelector(".purchase-line-qty").value = 1;
    row.querySelector(".purchase-line-unit").value = "Adet";
    row.querySelector(".purchase-line-price").value = 0;
    delete row.dataset.productId;
  } else {
    row.remove();
  }
  updateExpenseTotals();
});
els.addExpenseLineBtn.addEventListener("click", () => {
  els.expenseLines.insertAdjacentHTML("beforeend", createExpenseLineHtml(false));
  updateExpenseTotals();
});
els.customerForm.addEventListener("submit", createCustomer);
els.customerKind.addEventListener("change", () => {
  els.customerCode.value = nextCustomerCode(els.customerKind.value);
});
els.customerSearch.addEventListener("input", () => {
  tablePages.customers = 1;
  renderCustomers();
});
els.movementCustomerFilter.addEventListener("change", renderCustomerMovements);
els.movementSearch.addEventListener("input", renderCustomerMovements);
els.addTrackingBtn.addEventListener("click", () => openFormDialog(els.trackingFormDialog));
els.trackingForm.addEventListener("submit", createTracking);
els.trackingCustomer.addEventListener("change", () => renderTrackingCustomerQuotes());
els.trackingSearch.addEventListener("input", () => {
  tablePages.tracking = 1;
  renderCustomerTracking();
});
els.productForm.addEventListener("submit", createProduct);
els.productCost.addEventListener("input", updateProductSalePrice);
els.productCost.addEventListener("blur", handleMoneyInputBlur);
els.productPrice.addEventListener("blur", handleMoneyInputBlur);
els.productMargin.addEventListener("input", updateProductSalePrice);
els.productCsvInput.addEventListener("change", importProductsCsv);
els.sampleProductCsvBtn.addEventListener("click", downloadProductCsvSample);
els.bulkEditProductsBtn.addEventListener("click", toggleBulkProductEdit);
els.deleteAllProductsBtn.addEventListener("click", deleteAllProducts);
els.productTable.addEventListener("input", updateBulkProductRowPrice);
els.productTable.addEventListener("focusout", handleMoneyInputBlur);
els.productSearch.addEventListener("input", () => {
  tablePages.products = 1;
  renderProducts();
});
els.debtSearch.addEventListener("input", renderDebts);
els.debtCsvInput.addEventListener("change", importDebtsCsv);
els.sampleDebtCsvBtn.addEventListener("click", downloadDebtCsvSample);
els.deleteAllDebtsBtn.addEventListener("click", deleteAllDebts);
els.bulkDebtMessageSettingsBtn.addEventListener("click", openBulkMessageSettings);
els.bulkDebtWhatsappBtn.addEventListener("click", openBulkDebtWhatsappReminder);
els.selectAllDebts.addEventListener("change", toggleVisibleDebtsSelection);
els.debtTable.addEventListener("change", updateDebtSelection);
els.addDebtBtn.addEventListener("click", () => openFormDialog(els.debtFormDialog));
els.debtForm.addEventListener("submit", createDebt);
els.debtAmount.addEventListener("blur", formatDebtAmountInput);
els.receiptForm.addEventListener("submit", createReceipt);
els.addReceiptBtn.addEventListener("click", () => openFormDialog(els.receiptFormDialog));
els.receiptAmount.addEventListener("blur", handleMoneyInputBlur);
els.receiptCustomer.addEventListener("change", renderReceiptInvoiceOptions);
els.receiptSearch.addEventListener("input", () => {
  tablePages.receipts = 1;
  renderReceipts();
});
els.whatsappMessageForm.addEventListener("submit", sendEditedWhatsappMessage);
els.bulkMessageSettingsForm.addEventListener("submit", saveBulkMessageSettings);
els.bankForm.addEventListener("submit", createBankAccount);
els.companyLogoInput.addEventListener("change", saveCompanyLogo);
els.removeLogoBtn.addEventListener("click", removeCompanyLogo);
els.companyForm.addEventListener("submit", saveCompanyInfo);
els.userForm.addEventListener("submit", createUserAccount);
els.reportStartDate.addEventListener("change", renderReports);
els.reportEndDate.addEventListener("change", renderReports);
els.clearReportDatesBtn.addEventListener("click", () => {
  els.reportStartDate.value = "";
  els.reportEndDate.value = "";
  renderReports();
});
els.invoiceSearch.addEventListener("input", () => {
  tablePages.invoices = 1;
  renderInvoices();
});
els.addInvoiceCustomerBtn.addEventListener("click", () => openCustomerQuickAdd("invoice", "customer"));
els.quoteSearch.addEventListener("input", () => {
  tablePages.quotes = 1;
  renderQuotes();
});
els.addQuoteCustomerBtn.addEventListener("click", () => openCustomerQuickAdd("quote", "customer"));
els.expenseSearch.addEventListener("input", () => {
  tablePages.expenses = 1;
  renderExpenses();
});
els.addExpenseSupplierBtn.addEventListener("click", () => openCustomerQuickAdd("expense", "supplier"));
els.invoiceCsvInput.addEventListener("change", (event) => importInvoiceCsv(event, "sale"));
els.expenseCsvInput.addEventListener("change", (event) => importInvoiceCsv(event, "purchase"));
els.sampleInvoiceCsvBtn.addEventListener("click", () => downloadInvoiceCsvSample("sale"));
els.sampleExpenseCsvBtn.addEventListener("click", () => downloadInvoiceCsvSample("purchase"));
document.body.addEventListener("click", handleTableClicks);
els.exportBtn?.addEventListener("click", exportJson);
els.csvBtn.addEventListener("click", exportCsv);
els.importInput?.addEventListener("change", importJson);
els.quickInvoiceBtn.addEventListener("click", () => {
  switchView("invoices");
  openFormDialog(els.invoiceFormDialog);
});
els.addInvoiceBtn.addEventListener("click", () => openFormDialog(els.invoiceFormDialog));
els.addQuoteBtn.addEventListener("click", () => openFormDialog(els.quoteFormDialog));
els.addExpenseBtn.addEventListener("click", () => openFormDialog(els.expenseFormDialog));
els.addCustomerBtn.addEventListener("click", () => openFormDialog(els.customerFormDialog));
els.addProductBtn.addEventListener("click", () => openFormDialog(els.productFormDialog));
document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => closeFormDialog(button.closest("dialog")));
});
els.closeDialogBtn.addEventListener("click", () => els.invoiceDialog.close());
els.printInvoiceBtn.addEventListener("click", () => printPreviewAsPdf(els.invoicePreview, "Fatura PDF"));
els.closeReceiptDialogBtn.addEventListener("click", () => els.receiptDialog.close());
els.printReceiptBtn.addEventListener("click", () => printPreviewAsPdf(els.receiptPreview, "Tahsilat Makbuzu PDF"));
els.closeImageDialogBtn.addEventListener("click", () => els.imageDialog.close());
els.todoToolBtn.addEventListener("click", () => openMiniTool("todo"));
els.calendarToolBtn.addEventListener("click", () => openMiniTool("calendar"));
els.ratesToolBtn.addEventListener("click", () => openMiniTool("rates"));
els.closeMiniToolBtn.addEventListener("click", closeMiniTool);
els.todoForm.addEventListener("submit", addTodo);
els.calendarForm.addEventListener("submit", addCalendarNote);
els.refreshRatesBtn.addEventListener("click", fetchRates);
els.miniToolPanel.addEventListener("click", handleWidgetClick);

setDefaults();
renderAll();
applyAuthState();
initCloudSync();
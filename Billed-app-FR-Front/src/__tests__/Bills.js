/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = "";
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });
  describe("When I am on Bills page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = "";
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
  describe("When I am on Bills page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    describe("When I click the New Bill button", () => {
      test("Then I should be moved to the New Bill page", async () => {
        // Initialisation
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const store = mockStore;

        const bills = new Bills({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });
        const data = await bills.getBills();
        document.body.innerHTML = BillsUI({ data: data });

        // Simulation du clic
        const handleClick = jest.fn(bills.handleClickNewBill);
        const newBillButton = screen.getByTestId("btn-new-bill");
        newBillButton.addEventListener("click", handleClick);
        userEvent.click(newBillButton);

        expect(handleClick).toHaveBeenCalled();
        expect(screen.getByText("Envoyer")).toBeTruthy();
      });
    });
    describe("When I click the 'See' (eye) button", () => {
      test("Then a modal should appear", async () => {
        // Initialisation
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const store = mockStore;

        const bills = new Bills({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });
        const data = await bills.getBills();
        document.body.innerHTML = BillsUI({ data: data });

        // Détecter tous les boutons et récupérer arbitrairement le premier
        const seeButtons = screen.getAllByTestId("icon-eye");
        const firstButton = seeButtons[0];

        // Simulation du clic
        const modale = document.getElementById("modaleFile");
        $.fn.modal = jest.fn(() => modale.classList.add("show"));
        const handleClick = jest.fn(bills.handleClickIconEye(firstButton));
        firstButton.addEventListener("click", handleClick);
        userEvent.click(firstButton);

        expect(handleClick).toHaveBeenCalled();
        expect(modale.classList).toContain("show");
      });
    });
  });
});
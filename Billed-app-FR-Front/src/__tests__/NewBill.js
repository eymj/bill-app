/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I select a valid receipt", () => {
      test("Then the receipt should be set", () => {
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
        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        const fileInput = screen.getByTestId("file");

        // Création d'un fichier valide
        const fakeFile = new File(["foo"], "test.png", { type: "image/png" });

        // Vérifier que le fileInput est modifié
        expect(fileInput.files.length).toBe(0);
        userEvent.upload(fileInput, fakeFile);
        expect(fileInput.files.length).toBe(1);
      });
    }),
      describe("When I select an invalid receipt", () => {
        test("Then nothing should happen", () => {
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
          document.body.innerHTML = NewBillUI();
          const newBill = new NewBill({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
          });

          const fileInput = screen.getByTestId("file");

          // Création d'un fichier invalide
          const fakeFile = new File(["foo"], "test.png", {
            type: "text/plain",
          });

          // Vérifier que le fileInput reste vide
          expect(fileInput.files.length).toBe(0);
          userEvent.upload(fileInput, fakeFile);
          expect(fileInput.files.length).toBe(0);
        });
      }),
      describe("When I submit a bill", () => {
        describe("When the POST API call is successful", () => {
          test("Then we should go back to the bill list", () => {
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
            document.body.innerHTML = NewBillUI();
            const newBill = new NewBill({
              document,
              onNavigate,
              store,
              localStorage: window.localStorage,
            });

            expect(screen.getAllByText("Envoyer")).toBeTruthy();

            // Remplir le formulaire
            const bill = {
              type: "Hôtel et logement",
              name: "encore",
              amount: 400,
              date: "2004-04-04",
              vat: 80,
              pct: 20,
            };
            const type = screen.getByTestId("expense-type");
            const name = screen.getByTestId("expense-name");
            const amount = screen.getByTestId("amount");
            const date = screen.getByTestId("datepicker");
            const vat = screen.getByTestId("vat");
            const pct = screen.getByTestId("pct");
            const fileInput = screen.getByTestId("file");
            const fakeFile = new File(["foo"], "test.png", {
              type: "image/png",
            });
            type.value = bill.type;
            name.value = bill.name;
            amount.value = bill.amount;
            date.value = bill.date;
            vat.value = bill.vat;
            pct.value = bill.pct;
            userEvent.upload(fileInput, fakeFile);

            const form = screen.getByTestId("form-new-bill");
            fireEvent.submit(form);

            expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
          }),
            test("Then we should get an appropriate response", async () => {
              const getSpy = jest.spyOn(mockStore, "bills");

              const newBill = {
                id: "47qAXb6fIm2zOKkLzMro",
                vat: "80",
                fileUrl:
                  "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                status: "pending",
                type: "Hôtel et logement",
                commentary: "séminaire billed",
                name: "encore",
                fileName: "preview-facture-free-201801-pdf-1.jpg",
                date: "2004-04-04",
                amount: 400,
                commentAdmin: "ok",
                email: "a@a",
                pct: 20,
              };

              expect((await mockStore.bills().create(newBill)).key).toEqual("1234")
              expect(getSpy).toHaveBeenCalledTimes(1)
            });
        })
      });
  });
});
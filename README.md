# Chemical Inventory v.2.0

Chemical Inventory v.1.0 was an incredible project that not only provides a way to look up the current Carroll
College chemical inventory, but keeps Carroll College in compliance with chemical regulatory laws. In order
to continue to provide valuable resources to Carroll students, the Chemical Inventory site is in need of some
adjustments that will maintain federal compliance and offer a more streamlined user interface (UI). In
conjunction with the Chemistry Department, Chemical Inventory v.2.0 has been developed to enhance the UI,
migrate the current database to a modern coding solution, and provide detailed documentation to future
developers in order to maintain this application for years to come.

## Quick Links
* [Quick Start](#getting-started)
* [Deployment Documentation](documentation/deployment.md)
* [Developer Documentation](documentation/development.md)

## Developer Guide

### Overview of the System

|                | Current Implementation    | New Implementation               |
|----------------|---------------------------|----------------------------------|
| **Language**   | PHP (5.3) Web Application | Python (3.13)                    |
| **Database**   | MySQL (8.4)               | MySQL (8.4)                      |
| **Frameworks** | N/A                       | Flask (3.1.0) + React (19)       |
| **Server**     | Windows Server            | Ubuntu (22.04.2)                 |
| **Container**  | N/A                       | Docker (27.5.1)                  |
| **Memory**     | ???                       | 4 GB                             |
| **Storage**    | ???                       | 32 GB                            |
| **Host**       | CCIT                      | CCIT                             |

## User Guide

Chemical Inventory v.2.0 is a cloud-based chemical inventory management system designed to help laboratories efficiently
track and manage their chemical stocks. With an intuitive interface, it simplifies the process of adding, searching, and
organizing chemical containers.

### Key Features

* **Cloud-Based Access**: Access your inventory from any device with an internet connection—no installations required.
* **Chemical Search**: Search for compounds by name or filter by room location, sub location, or manufacturers.
* **Chemical Inventory**: Easily take an inventory of a location/sub-location to ensure all chemicals are accounted for.
* **Safety Information**: View unique chemical safety information and pictographs of the chemical makeup.
* **File Storage**: Upload and link Safety Data Sheets (SDS) to each chemical and access a log that tracks each chemical
  and whether it has an SDS linked.

### Getting Started

1. **Visit the Website**: Navigate to the Okta Tile 'Chemical Inventory' using your preferred web browser.
2. **Sign In or Register**: Create an account with Okta or login using your existing Okta credentials.
3. **Modify the Inventory**: Add new chemicals, edit chemicals, add new manufacturers, add or remove chemical locations,
   etc.
4. **Manage Users**: Upgrade users to admin or faculty status, or demote to student status. This modifies control access and
   permissions based on the user level.
    * **Admin**: The highest level of access. Can grant admin/faculty access to members of the site. Can modify the
      database.
    * **Faculty**: Advanced access. Can modify the database, but cannot manage access to the site.
    * **Student**: Can only view the chemicals and search. No database modification.

### Use Cases

The biggest objective of this update is to establish a more user-friendly UI. The following updates are
the steps to achieve this goal.

1. _Student Home Page Updates_

* The student will be able to click on the Chemical Inventory tile on Carroll College's Okta page.
* The student will be redirected to the Carroll College Okta sign in.
    * Okta will handle improper sign in validation with warnings for invalid login and success for successful login.
* Upon successful Okta validation, the student will be redirected to the home screen.
* The home screen contains a search bar for chemical lookups, various checkboxes for filtering by chemical or
  manufacturer, and a large table (resembling a classic Excel table) containing all chemicals.
* The student sees a general page of all chemicals listed only once. To view more details about a chemical, the user can
  click on the chemical and view information regarding its location, the quantities of bottles of the chemical, and the
  sticker number.
* The student is not allowed to modify the database. They can only read from it.
* The student can interact with the data via search inputs, filtering by manufacturer, and filtering by popular
  chemicals.

2. _Chemical Searching_

* A student that wants to know where a particular chemical is located in the building can use this application to search
  efficiently.
* The student can search by the chemical name (application uses a string matching algorithm to ensure related
  results appear).
* The search will return a list of chemicals in tabular format for every match relating to the search.
* Dead chemicals (expired products or used bottles) will not populate the search.
* No duplicate chemicals will populate the search.

3. _Updating the Inventory_

* A faculty or admin can update the inventory with a simplified form on the home screen of the application.
* Upon clicking the form, a modal box will pop up containing prompts for chemical information, including:
    * Chemical Name
    * Chemical Abbreviation
    * Chemical ID Number (sticker identification)
    * Manufacturer
    * Location
    * Sub-Location

4. _Faculty Permissions and Uses_

* Faculty have elevated permissions which allow for database modification.
* Faculty have additional navigation menus that allow for numerous data categories to be added, including:
    * Create manufacturer information
    * New chemicals introduced
    * Chemical updates (whether it's dead)
    * Assigning new professors 'faculty-level' access
    * Delete a chemical once confirmed 'dead'
    * Update manufacturer information
    * Update chemical storage class
    * Add material safety data sheets to each chemical

# Privacy Policy

**Last Updated: March 3, 2026**

---

## 1. Overview

**ICE Forensic** provides web-based Hex Viewer and EXIF analysis tools, prioritizing user privacy and data security. This Privacy Policy explains what information we collect, how it is used, and how it is protected when you use our services.

## 2. Information We Collect and How We Collect It

To provide and maintain our services securely, the following minimal information may be collected automatically, and certain data may be processed via external APIs when using specific features:

- **Automatically Collected Data:** Device and environment information such as browser type and version, operating system (OS), and date/time of visit. _(※ IP addresses are not directly collected by us, but are processed according to the policies of our third-party hosting and analytics providers.)_
- **Statistics and Error Data:** Third-party analytics data (Google Analytics) used for analyzing website traffic, usability, and service error diagnosis (e.g., error codes, toast message identifiers).
- **User-Requested Third-Party Data Transmission:**
  - **IP Address:** When you explicitly use the "Check My IP" feature (by clicking the button), your real-time IP address is transmitted to the external API service **ipinfo.io** to retrieve the relevant information.
  - **Location Data (Latitude/Longitude):** When you request location information from a photo, the coordinate data is transmitted to **Nominatim (OpenStreetMap)** and **Leaflet** linked servers for map visualization and address conversion (Reverse Geocoding).

**※ Information We DO NOT Collect or Transmit:** The **original contents, filenames, unrequested metadata of the files you load into the browser for analysis, and personally identifiable information (PII) such as your name or email, are NEVER collected or transmitted to our servers.**

## 3. Purpose of Data Processing

The collected information is used strictly for the following purposes:

- To operate smoothly, maintain stability, and improve the user experience (UX) of our services.
- To block abnormal access, respond to security threats, and perform statistical analysis.
- To comply with legal obligations and resolve disputes.

## 4. Data Processing and Security (Important)

This service does not collect or store users' sensitive data through its own web servers or databases. We securely process data according to the following principles:

- **100% Local Browser Processing:** File data (Hex, EXIF, etc.) analysis is executed entirely and exclusively within your device's browser using WebAssembly (Wasm) and browser APIs. Under no circumstances are the original files transmitted or shared externally.
- **External API Calls by Explicit Consent:** Features like IP lookup and location (address) conversion **operate only when you explicitly request them (e.g., by clicking a button)**. We do not arbitrarily transmit your location or IP information in the background without your action.
- **Third-Party Protection Policies:** Temporary data (IP, coordinates, etc.) transmitted externally (to ipinfo.io, OpenStreetMap, etc.) to perform these functions is subject to the privacy policies of the respective service providers. We do not separately store, process, or combine this data with other data.
- **Anonymized Statistics Collection:** Event and error logs (such as `message_code`) transmitted to Google Analytics for service improvement are strictly anonymized so that individuals cannot be identified.

## 5. Data Retention and Deletion

ICE Forensic is provided as a static website hosted on GitHub Pages and does not operate its own web servers or databases. Therefore, **we do not directly collect or store users' website access logs (such as IP addresses)** as stipulated by communications privacy laws. _(Note: For website hosting and security purposes, our hosting provider, GitHub, may collect standard system logs in accordance with GitHub's Privacy Policy.)_

Anonymized statistics and error data (such as `message_code`) collected via third-party analytics tools (Google Analytics) for service improvement and error diagnosis are retained for a **maximum of 14 months**. The retention period is renewed upon new activity from the same browser. Once the retention period expires, the data is permanently destroyed in an unrecoverable manner according to the policy of the respective service.

## 6. Use of Cookies and Local Storage

ICE Forensic uses cookies and local storage to provide a customized environment and improve service quality.

- **Local Storage:** Used to save your browser preferences (e.g., dark mode, UI layout settings). This data is stored locally on your device and is not transmitted to our servers.
- **Cookies:** Used for website visitor statistics, measuring the frequency of errors in specific features, and preventing abnormal access via third-party analytics tools (Google Analytics).
- **Opting Out:** You can configure your web browser to block cookies or manually clear your local storage data. However, doing so may reset your environment preferences or limit the availability of certain convenience features.

## 7. User Rights

Users have the right to request access, correction, deletion, or suspension of processing regarding their personal data. However, since ICE Forensic does not collect personally identifiable information, requests pertaining to anonymized data (like access logs) will be handled within the scope of applicable laws. To exercise these rights, please contact us using the information below.

## 8. Contact Information

If you have any questions or concerns regarding our privacy practices or data security, please contact us:

- **Email:** [dbzoseh84@gmail.com](mailto:dbzoseh84@gmail.com)
- **Data Protection Officer:** Jeonggyun Park

## 9. Changes to This Policy

We may update this Privacy Policy from time to time to reflect changes in legal requirements or our services. If we make significant changes, we will provide advance notice through announcements on our website.

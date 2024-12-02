// Importing necessary interfaces
import { IOrderState } from "@interfaces/bll/order.interface";
import { IParamPreviewOrder } from "@interfaces/order/paramsPreview.interface";

// Function to map order state to parameters
export const mapOrderStateToParams = async (state: IOrderState) => {
  const currentId = state.draftId ?? state._id;
  let designLink = '';  // Declare designLink outside of the async block

  try {
    // Fetch the data asynchronously
    const response = await fetch('https://storage.googleapis.com/storage/v1/b/ceriga-storage-bucket/o/');
    const data = await response.json();

    // Ensure 'data' is available before trying to access 'items'
    if (data.items) {
      const names = data.items.map((item) => item.name);
      const filteredNames = names.filter((name) =>
        name.includes(`${currentId}/designUploads`)
      );
      console.log('filteredNames:', filteredNames);  // Log the filtered names

      if (filteredNames.length > 0) {
        // Update the designLink here before using it further
        designLink = `https://storage.googleapis.com/ceriga-storage-bucket/${filteredNames[0]}`;
      }
    } else {
      console.error('No items found in the response.');
    }

    // Now, you can use the updated designLink here because we are waiting for the fetch to complete
    console.log("Updated DesignLink:", designLink);

  } catch (error) {
    console.error('Error fetching data:', error);  // Handle any errors that occur
  }

  // Define the data structure to be returned
  const data: IParamPreviewOrder[] = [
    {
      title: "Fabrics",
      paramsType: "list",
      subparameters: [
        { title: "Materials", value: state.material.name || "" },
        { title: "GSM", value: state.material.value || "" },
      ],
    },
    {
      title: "Colour",
      paramsType: "list",
      subparameters: [
        { title: "Hex Code", value: state.color.hex || "" },
        { title: "Color Description", value: state.color.description || "" },
        { title: "Dye style", value: state.dyeStyle || "" },
        { title: "Extra details", value: state.stitching.description || "" },
      ],
    },
    {
      title: "Neck label",
      paramsType: "list",
      subparameters: [
        {
          title: "Design",
          isLink: true,
          link: designLink, // Use the fetched design link here
        },
        {
          title: "Design Options",
          value: state.neck.additional.material || "",
        },
        { title: "Neck Label Description", value: state.neckDescription || "" },
        { title: "Material", value: state.neck.additional.material || "" },
        { title: "Colour", value: state.neck.additional.color || "" },
      ],
    },
    {
      title: "Care label",
      paramsType: "list",
      subparameters: [
        {
          title: "",
          isLink: true,
          titleStyle: "bold",
          link: `https://storage.googleapis.com/ceriga-storage-bucket/${currentId}/labelUploads/`,
        },
      ],
    },
    {
      title: "Design",
      paramsType: "list",
      subparameters: [
        {
          title: "Design",
          isLink: true,
          titleStyle: "bold",
          link: designLink, // Use the fetched design link here
        },
        { title: "Extra Details", value: state.stitching.description || "" },
        { title: "Stitching", value: state.stitching.type || "" },
        { title: "Custom Stitching", value: "" },
        { title: "Fading", value: state.fading.type || "" },
        { title: "Custom Fading", value: "" },
      ],
    },
    {
      title: "Packaging",
      paramsType: "list",
      subparameters: [
        {
          title: "Packaging Type",
          value: state.package.isPackage ? "Packaged" : "Unpackage",
        },
        { title: "Extra Details", value: state.package.description || "" },
        {
          title: "Images",
          isLink: true,
          titleStyle: "bold",
          link: `https://storage.googleapis.com/ceriga-storage-bucket/${currentId}/packageUploads/`,
        },
      ],
    },
    {
      title: "Quantity",
      paramsType: "table",
      subparameters: state.quantity.list.map((item) => ({
        title: item.name,
        value: item.value.toString(),
      })),
    },
  ];

  // Return the data structure
  return data;
};

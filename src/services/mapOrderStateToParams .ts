// Importing necessary interfaces
import { IOrderState } from "@interfaces/bll/order.interface";
import { IParamPreviewOrder } from "@interfaces/order/paramsPreview.interface";

// Async function to fetch the design link
const fetchDesignLink = async (currentId: string): Promise<string> => {
  try {
    // Fetch the design data from the API
    const response = await fetch('https://storage.googleapis.com/storage/v1/b/ceriga-storage-bucket/o/');
    const responseData = await response.json();

    // Ensure responseData.items is an array
    if (Array.isArray(responseData.items)) {
      const names = responseData.items.map(item => item.name);
      const filteredNames = names.filter(name => name.includes(`${currentId}/designUploads`));

      // Log the filtered names to the console for debugging
      console.log("Filtered Names:", filteredNames);

      // Return the first matching design link or an empty string
      return filteredNames.length > 0 ? `https://storage.googleapis.com/ceriga-storage-bucket/${filteredNames[0]}` : '';
    } else {
      console.error('Items is not an array:', responseData.items);
      return ''; // Return an empty string if items is not an array
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return ''; // Return an empty string if there's a fetch error
  }
};

// Function to map order state to parameters
export const mapOrderStateToParams = async (state: IOrderState) => {
  const currentId = state.draftId ?? state._id;
  console.log(currentId);

  // Fetch the design link asynchronously
  const designLink = await fetchDesignLink(currentId);

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

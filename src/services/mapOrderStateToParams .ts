import { IOrderState } from "@interfaces/bll/order.interface";
import { IParamPreviewOrder } from "@interfaces/order/paramsPreview.interface";

export const mapOrderStateToParams = async (state: IOrderState) => {
  const currentId = state.draftId ?? state._id;
  console.log(currentId);

  // Fetch the design link based on the orderId (currentId)
const fetchDesignLink = async (): Promise<string> => {
  try {
    const response = await fetch('https://storage.googleapis.com/storage/v1/b/ceriga-storage-bucket/o/');
    const responseData = await response.json();
    console.log('API Response:', responseData);

    // Check if items exist and are valid
    if (!responseData.items || !Array.isArray(responseData.items)) {
      console.error('Expected items array but got:', responseData.items);
      return ''; // Return empty string if items are not found or not an array
    }

    // Filter out invalid entries that might not contain 'name'
    const validItems = responseData.items.filter(item => item.name && item.name.includes('designUploads'));
    
    // Now map over the valid items
    const names = validItems.map(item => item.name);
    const filteredNames = names.filter(name => name.includes(`${currentId}/designUploads`));
    console.log("Filtered Names:", filteredNames);

    return filteredNames.length > 0 ? `https://storage.googleapis.com/ceriga-storage-bucket/${filteredNames[0]}` : '';
  } catch (error) {
    console.error('Error fetching data:', error);
    return ''; // Return empty string if fetch fails
  }
};

  // Fetch the design link asynchronously
  const designLink = await fetchDesignLink();

  // Order data, now with the designLink already fetched
  const orderData: IParamPreviewOrder[] = [
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
          link: `https://storage.googleapis.com/ceriga-storage-bucket/${currentId}/neckUploads/`,
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
          link: designLink, // The design link is updated before returning the data
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

  // Return order data with the design link filled
  return orderData;
};

const getChildCategories = async (models, categories) => {
  let catIds = []
  for (const category of categories) {
    const childs = await models.ProductCategories.find({
      order: { $regex: `^${category.order}.*`, $options: 'i' }
    }).sort({ order: 1 });

    catIds = catIds.concat(childs.map(ch => ch._id));
  }

  return models.ProductCategories.find({_id: {$in: catIds}})
}

export default {
  routes: [
    {
      method: 'GET',
      path: '/pos',
      handler: async ({ req, models }) => {
        const token = req.headers['pos-token'];
        const pos = await models.Pos.findOne({ token });
        const data: any = { pos };

        const userFields = {
          email: 1,
          username: 1,
          password: 1,
          isOwner: 1,
          isActive: 1,
          details: 1
        };

        // qpay configs
        const qpayUrl = await models.Configs.findOne({ code: 'qpayUrl' });
        const qpayCallbackUrl = await models.Configs.findOne({ code: 'callbackUrl' });
        const qpayMerchantUser = await models.Configs.findOne({ code: 'qpayMerchantUser' });
        const qpayMerchantPassword = await models.Configs.findOne({ code: 'qpayMerchantPassword' });
        const qpayInvoiceCode = await models.Configs.findOne({ code: 'qpayInvoiceCode' });

        if (pos) {
          data.qpayConfig = {
            url: qpayUrl && qpayUrl.value,
            callbackUrl: qpayCallbackUrl && qpayCallbackUrl.value,
            username: qpayMerchantUser && qpayMerchantUser.value,
            password: qpayMerchantPassword && qpayMerchantPassword.value,
            invoiceCode: qpayInvoiceCode && qpayInvoiceCode.value
          };
        }

        // collect admin users
        if (pos.adminIds) {
          data.adminUsers = await models.Users.find({
            _id: { $in: pos.adminIds },
            isActive: true
          }, userFields).lean();
        }

        // collect cashiers
        if (pos.cashierIds) {
          data.cashiers = await models.Users.find({
            _id: { $in: pos.cashierIds },
            isActive: true
          }, userFields).lean();
        }

        if (pos.formIntegrationIds) {
          const leadIntegrations = await models.Integrations.find({
            _id: { $in: pos.formIntegrationIds },
            kind: 'lead'
          });

          const WIDGETS_DOMAIN = process.env.WIDGETS_DOMAIN;

          const forms = [];

          for (const integration of leadIntegrations) {
            const form = await models.Forms.getForm(integration.formId);
            const brand = await models.Brands.getBrand({
              _id: integration.brandId
            });

            const installScript = `<script>
            window.erxesSettings = {
              forms: [{
                brand_id: "${brand.code}",
                form_id: "${form.code}"
              }],
            };

          (function() {
            var script = document.createElement('script');
            script.src = "${WIDGETS_DOMAIN}/build/formWidget.bundle.js";
            script.async = true;

            var entry = document.getElementsByTagName('script')[0];
            entry.parentNode.insertBefore(script, entry);
          })();

          </script>`;
            forms.push({ installScript, name: integration.name });
          }

          data.forms = forms;
        }

        const groups = await models.ProductGroups.groups(models, pos._id);

        const productGroups = [];

        for (const group of groups) {
          const chosenCategories = await models.ProductCategories.find({
            $and: [
              { _id: { $in: group.categoryIds || [] } },
            ]
          });

          const chosenExcludeCategories = await models.ProductCategories.find({
            $and: [
              { _id: { $in: group.excludedCategoryIds } }
            ]
          });

          const includeCategories = await getChildCategories(models, chosenCategories);
          const excludeCategories = await getChildCategories(models, chosenExcludeCategories);
          const excludeCatIds = excludeCategories.map(c => (c._id));

          const productCategories = includeCategories.filter(c => (!excludeCatIds.includes(c._id)));

          const categories = [];

          for (const category of productCategories) {
            const products = await models.Products.find({
              status: { $ne: 'deleted' },
              categoryId: category._id,
              _id: { $nin: group.excludedProductIds }
            });

            category.products = products;

            categories.push({
              _id: category._id,
              name: category.name,
              description: category.description,
              code: category.code,
              parentId: category.parentId,
              order: category.order,
              attachment: category.attachment,
              products
            });
          }

          group.categories = categories;
          productGroups.push(group);
        } // end product group for loop

        data.productGroups = productGroups;

        // consider 'customer' state as valid customers
        data.customers = await models.Customers.find({ state: 'customer' }).lean();

        return data;
      }
    } // end /pos route
  ]
};

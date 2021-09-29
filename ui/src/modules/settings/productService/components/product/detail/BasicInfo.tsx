import { Content } from 'modules/boards/styles/item';
import Attachment from 'modules/common/components/Attachment';
import FormControl from 'modules/common/components/form/Control';
import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { InfoWrapper } from 'modules/common/styles/main';
import { IAttachment } from 'modules/common/types';
import { __, Alert, confirm } from 'modules/common/utils';

import { Action, Name } from 'modules/customers/styles';
import Sidebar from 'modules/layout/components/Sidebar';
import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from 'modules/layout/styles';
import ProductForm from 'modules/settings/productService/containers/product/ProductForm';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import xss from 'xss';

type Props = {
  product: IProduct;
  remove: () => void;
  chooseFeature: (_id: string, counter: string) => void;
};

class BasicInfo extends React.Component<Props> {

  onRadio = (e) => {
    const { product, chooseFeature } = this.props;
    chooseFeature(product._id, e.target.value);
  }

  renderVendor = vendor => {
    if (!vendor) {
      return (
        <li>
          <FieldStyle>{__(`Vendor`)}</FieldStyle>
          <SidebarCounter>-</SidebarCounter>
        </li>
      );
    }

    return (
      <li>
        <FieldStyle>{__(`Vendor`)}</FieldStyle>

        <Link to={`/companies/details/${vendor._id}`}>
          <SidebarCounter>{vendor.primaryName || ''}</SidebarCounter>
        </Link>
      </li>
    );
  };

  renderSupply = supply => {
    const supplyView = supply ? supply : '-';
    return (
      <li>
        <FieldStyle>{__(`Supply`)}</FieldStyle>
        <SidebarCounter>{supplyView}</SidebarCounter>
      </li>
    );
  };

  renderProductCount = proCnt => {
    const proCntView = proCnt ? proCnt : 0;
    return (
      <li>
        <FieldStyle>{__(`Product count`)}</FieldStyle>
        <SidebarCounter>{proCntView}</SidebarCounter>
      </li>
    );
  };

  renderMinimiumCount = minCnt => {
    const minCntView = minCnt ? minCnt : 0;
    return (
      <li>
        <FieldStyle>{__(`Minimium count`)}</FieldStyle>
        <SidebarCounter>{minCntView}</SidebarCounter>
      </li>
    );
  }

  renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  renderAction() {
    const { remove } = this.props;

    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch(error => {
          Alert.error(error.message);
        });

    return (
      <Action>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button btnStyle="simple" size="medium">
              {__('Action')}
              <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <a href="#delete" onClick={onDelete}>
                {__('Delete')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </Action>
    );
  }

  renderFeatures = (items?: IAttachment[], feature?: IAttachment) => {
    if (!items || items.length === 0 || !feature) {
      return null;
    }

    const elemets: any[] = [];
    let counter = 0;
    for (const item of items) {

      const checked = feature.name === item.name ? true : false;

      const tempElement = (
        <FormControl
          name="SelectFeature"
          onChange={this.onRadio}
          value={counter}
          checked={checked}
          componentClass="radio"
        >
          {item.name}
        </FormControl>
      )
      counter++;

      elemets.push(tempElement);
    };

    return elemets;

  };

  renderImage = (item: IAttachment) => {
    if (!item) {
      return null;
    }

    return <Attachment attachment={item} />
  };

  renderInfo() {
    const { product } = this.props;

    const content = props => <ProductForm {...props} product={product} />;

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{product.name}</Name>
          <ModalTrigger
            title="Edit basic info"
            trigger={<Icon icon="edit" />}
            size="lg"
            content={content}
          />
        </InfoWrapper>

        {this.renderAction()}

        {this.renderImage(product.attachment)}
        {this.renderFeatures(product.attachmentMore, product.attachment)}
        <SidebarList className="no-link">
          {this.renderRow('Code', product.code)}
          {this.renderRow('Type', product.type)}
          {this.renderRow(
            'Category',
            product.category ? product.category.name : ''
          )}
          {this.renderRow(
            'Unit price',
            (product.unitPrice || 0).toLocaleString()
          )}
          {this.renderRow('Sku', product.sku)}
          {this.renderVendor(product.vendor)}
          {this.renderSupply(product.supply)}
          {this.renderProductCount(product.productCount)}
          {this.renderMinimiumCount(product.minimiumCount)}
          <SidebarFlexRow>{__(`Description`)}</SidebarFlexRow>
        </SidebarList>
        <Content
          dangerouslySetInnerHTML={{
            __html: xss(product.description)
          }}
        />
      </Sidebar.Section>
    );
  }

  render() {
    return this.renderInfo();
  }
}

export default BasicInfo;
